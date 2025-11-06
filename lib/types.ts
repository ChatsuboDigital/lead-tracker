export interface Lead {
  email: string;
  display_name: string | null;
  campaigns: string[];
  date_added: string;
  last_updated: string;
  source_data: Record<string, any>;
}

export interface CSVRow {
  [key: string]: string;
}

export interface UploadResult {
  validLeads: CSVRow[];
  invalidEmails: string[];
  emailColumn: string;
  campaignName: string;
}

export interface DuplicateCheckResult {
  newLeads: CSVRow[];
  duplicates: Lead[];
}

export interface ExportOptions {
  format: 'all' | 'core' | 'email-only';
  filename: string;
  tagWithCampaign: boolean;
  campaignName?: string;
}

export interface SearchFilters {
  query?: string;
  campaigns?: string[];
  excludeCampaigns?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  leads: Lead[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface StatsData {
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  totalCampaigns: number;
}

