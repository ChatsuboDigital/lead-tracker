import Papa from 'papaparse';
import { supabase } from './supabase';
import { Lead, CSVRow, DuplicateCheckResult, SearchFilters, SearchResult, StatsData } from './types';
import { startOfWeek, startOfMonth, endOfDay } from 'date-fns';

// Email column patterns to detect
const EMAIL_PATTERNS = [
  'email',
  'e-mail',
  'email address',
  'work email',
  'business email',
  'mail',
  'e mail',
  'emailaddress',
];

/**
 * Detect email column from CSV headers
 */
export function detectEmailColumn(headers: string[]): string | null {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // First, try exact matches
  for (const pattern of EMAIL_PATTERNS) {
    const index = normalizedHeaders.indexOf(pattern);
    if (index !== -1) {
      return headers[index];
    }
  }
  
  // Then try partial matches
  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    if (EMAIL_PATTERNS.some(pattern => normalized.includes(pattern))) {
      return header;
    }
  }
  
  return null;
}

/**
 * Find all potential email columns
 */
export function findAllEmailColumns(headers: string[]): string[] {
  const emailColumns: string[] = [];
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (let i = 0; i < headers.length; i++) {
    const normalized = normalizedHeaders[i];
    if (EMAIL_PATTERNS.some(pattern => normalized.includes(pattern))) {
      emailColumns.push(headers[i]);
    }
  }
  
  return emailColumns;
}

/**
 * Extract campaign name from filename
 */
export function extractCampaignName(filename: string): string {
  let name = filename;
  
  // Remove .csv extension
  name = name.replace(/\.csv$/i, '');
  
  // Remove date patterns
  name = name.replace(/\d{4}-\d{2}-\d{2}/g, ''); // YYYY-MM-DD
  name = name.replace(/\d{2}-\d{2}-\d{4}/g, ''); // MM-DD-YYYY
  name = name.replace(/\d{8}/g, ''); // YYYYMMDD
  
  // Replace dashes and underscores with spaces
  name = name.replace(/[-_]+/g, ' ');
  
  // Remove extra spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name || 'Untitled Campaign';
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse CSV file
 */
export function parseCSV(file: File): Promise<{ data: CSVRow[]; headers: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data as CSVRow[],
          headers: results.meta.fields || [],
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Check for duplicate emails in database
 */
export async function checkDuplicates(
  emails: string[],
  csvData: CSVRow[],
  emailColumn: string
): Promise<DuplicateCheckResult> {
  // Normalize emails
  const normalizedEmails = emails.map(e => e.toLowerCase().trim());
  
  // Query database for existing leads
  const { data: existingLeads, error } = await supabase
    .from('leads')
    .select('*')
    .in('email', normalizedEmails);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  const existingEmailSet = new Set(existingLeads?.map(l => l.email) || []);
  
  // Split into new and duplicates
  const newLeads: CSVRow[] = [];
  const duplicates: Lead[] = [];
  
  csvData.forEach((row) => {
    const email = row[emailColumn]?.toLowerCase().trim();
    if (email && validateEmail(email)) {
      if (existingEmailSet.has(email)) {
        const existingLead = existingLeads?.find(l => l.email === email);
        if (existingLead) {
          duplicates.push(existingLead);
        }
      } else {
        newLeads.push(row);
      }
    }
  });
  
  return { newLeads, duplicates };
}

/**
 * Save leads to database
 */
export async function saveLeads(
  leads: CSVRow[],
  emailColumn: string,
  campaign: string
): Promise<{ success: boolean; count: number }> {
  console.log('saveLeads called with:', { leadCount: leads.length, emailColumn, campaign });
  
  const leadsToInsert = leads.map((row) => {
    const email = row[emailColumn].toLowerCase().trim();
    
    // Try to extract display name
    let displayName = email;
    if (row['first_name'] && row['last_name']) {
      displayName = `${row['first_name']} ${row['last_name']}`.trim();
    } else if (row['first name'] && row['last name']) {
      displayName = `${row['first name']} ${row['last name']}`.trim();
    } else if (row['name']) {
      displayName = row['name'];
    } else if (row['full_name']) {
      displayName = row['full_name'];
    } else if (row['full name']) {
      displayName = row['full name'];
    }
    
    return {
      email,
      display_name: displayName,
      campaigns: [campaign.trim()],
      source_data: row,
    };
  });
  
  console.log('Prepared leads for insert:', { count: leadsToInsert.length, firstLead: leadsToInsert[0] });
  
  const { data, error, count } = await supabase
    .from('leads')
    .upsert(leadsToInsert, { onConflict: 'email' })
    .select();
  
  console.log('Supabase upsert result:', { data, error, count });
  
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to save leads: ${error.message}`);
  }
  
  return { success: true, count: count || leadsToInsert.length };
}

/**
 * Add campaign to existing leads
 */
export async function addCampaignToLeads(
  emails: string[],
  campaign: string
): Promise<{ success: boolean; count: number }> {
  const normalizedEmails = emails.map(e => e.toLowerCase().trim());
  const trimmedCampaign = campaign.trim();
  
  // Fetch existing leads
  const { data: existingLeads, error: fetchError } = await supabase
    .from('leads')
    .select('email, campaigns')
    .in('email', normalizedEmails);
  
  if (fetchError) {
    throw new Error(`Failed to fetch leads: ${fetchError.message}`);
  }
  
  // Update each lead with the new campaign if not already present
  const updates = existingLeads
    ?.filter(lead => !lead.campaigns.includes(trimmedCampaign))
    .map(lead => ({
      email: lead.email,
      campaigns: [...lead.campaigns, trimmedCampaign],
    })) || [];
  
  if (updates.length === 0) {
    return { success: true, count: 0 };
  }
  
  const { error: updateError } = await supabase
    .from('leads')
    .upsert(updates, { onConflict: 'email' });
  
  if (updateError) {
    throw new Error(`Failed to update campaigns: ${updateError.message}`);
  }
  
  return { success: true, count: updates.length };
}

/**
 * Export leads to CSV in original format (preserves exact structure)
 */
export function exportOriginalCSV(rows: CSVRow[]): Blob {
  // Export exactly as uploaded - just the raw CSV rows
  const csv = Papa.unparse(rows);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Export leads to CSV
 */
export function exportToCSV(
  leads: Lead[],
  format: 'all' | 'core' | 'email-only',
  filename: string
): Blob {
  let csvData: any[];
  
  if (format === 'email-only') {
    csvData = leads.map(l => ({ email: l.email }));
  } else if (format === 'core') {
    csvData = leads.map(l => ({
      email: l.email,
      display_name: l.display_name,
      campaigns: l.campaigns.join('; '),
      date_added: l.date_added,
    }));
  } else {
    // All fields - use source_data to preserve original format
    csvData = leads.map(l => l.source_data);
  }
  
  const csv = Papa.unparse(csvData);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Search leads with filters
 */
export async function searchLeads(
  filters: SearchFilters = {}
): Promise<SearchResult> {
  const {
    query = '',
    campaigns = [],
    excludeCampaigns = [],
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = filters;
  
  let queryBuilder = supabase.from('leads').select('*', { count: 'exact' });
  
  // Apply email search with fuzzy matching
  if (query) {
    queryBuilder = queryBuilder.ilike('email', `%${query}%`);
  }
  
  // Apply campaign filters
  if (campaigns.length > 0) {
    queryBuilder = queryBuilder.overlaps('campaigns', campaigns);
  }
  
  // Apply exclude campaigns filter
  if (excludeCampaigns.length > 0) {
    queryBuilder = queryBuilder.not('campaigns', 'ov', excludeCampaigns);
  }
  
  // Apply date range filters
  if (startDate) {
    queryBuilder = queryBuilder.gte('date_added', startDate.toISOString());
  }
  
  if (endDate) {
    queryBuilder = queryBuilder.lte('date_added', endOfDay(endDate).toISOString());
  }
  
  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  queryBuilder = queryBuilder
    .order('date_added', { ascending: false })
    .range(from, to);
  
  const { data, error, count } = await queryBuilder;
  
  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
  
  return {
    leads: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  };
}

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<StatsData> {
  // Total leads
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });
  
  // Leads this week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const { count: leadsThisWeek } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('date_added', weekStart.toISOString());
  
  // Leads this month
  const monthStart = startOfMonth(new Date());
  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('date_added', monthStart.toISOString());
  
  // Total unique campaigns
  const { data: allLeads } = await supabase
    .from('leads')
    .select('campaigns');
  
  const uniqueCampaigns = new Set<string>();
  allLeads?.forEach(lead => {
    lead.campaigns?.forEach((campaign: string) => uniqueCampaigns.add(campaign));
  });
  
  return {
    totalLeads: totalLeads || 0,
    leadsThisWeek: leadsThisWeek || 0,
    leadsThisMonth: leadsThisMonth || 0,
    totalCampaigns: uniqueCampaigns.size,
  };
}

/**
 * Get all unique campaigns
 */
export async function getAllCampaigns(): Promise<string[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('campaigns');
  
  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }
  
  const uniqueCampaigns = new Set<string>();
  data?.forEach(lead => {
    lead.campaigns?.forEach((campaign: string) => uniqueCampaigns.add(campaign));
  });
  
  return Array.from(uniqueCampaigns).sort();
}

/**
 * Delete leads by email
 */
export async function deleteLeads(emails: string[]): Promise<{ success: boolean; count: number }> {
  const { error, count } = await supabase
    .from('leads')
    .delete()
    .in('email', emails);
  
  if (error) {
    throw new Error(`Failed to delete leads: ${error.message}`);
  }
  
  return { success: true, count: count || 0 };
}

/**
 * Update lead notes
 */
export async function updateLeadNotes(email: string, notes: string): Promise<void> {
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('source_data')
    .eq('email', email)
    .single();
  
  if (fetchError) {
    throw new Error(`Failed to fetch lead: ${fetchError.message}`);
  }
  
  const updatedSourceData = {
    ...lead.source_data,
    notes,
  };
  
  const { error: updateError } = await supabase
    .from('leads')
    .update({ source_data: updatedSourceData })
    .eq('email', email);
  
  if (updateError) {
    throw new Error(`Failed to update notes: ${updateError.message}`);
  }
}

