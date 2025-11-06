'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, CSVRow } from '@/lib/types';
import { exportOriginalCSV, downloadBlob } from '@/lib/helpers';
import { toast } from 'sonner';

interface DuplicateResultsProps {
  newLeads: CSVRow[];
  duplicates: Lead[];
  emailColumn: string;
  campaignName: string;
  allData: CSVRow[];
  onSaveComplete: () => void;
}

export function DuplicateResults({
  newLeads,
  duplicates,
  emailColumn,
  campaignName,
  allData,
  onSaveComplete,
}: DuplicateResultsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filterLeads = (leads: any[], query: string) => {
    if (!query.trim()) return leads;
    
    const lowerQuery = query.toLowerCase();
    return leads.filter((lead) => {
      const email = lead.email || lead[emailColumn] || '';
      return email.toLowerCase().includes(lowerQuery);
    });
  };

  const filteredNewLeads = filterLeads(newLeads, searchQuery);
  const filteredDuplicates = filterLeads(duplicates, searchQuery);

  const handleExportCleanCSV = () => {
    if (newLeads.length === 0) {
      toast.error('No new leads to export.');
      return;
    }

    setIsSaving(true);
    try {
      // Export to CSV - preserve exact original format
      const csvBlob = exportOriginalCSV(newLeads);
      const filename = `${campaignName.toLowerCase().replace(/\s+/g, '-')}-duplicates-removed-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadBlob(csvBlob, filename);
      
      toast.success(`Clean CSV downloaded! (${newLeads.length} leads, ${duplicates.length} duplicates removed)`);
    } catch (error) {
      toast.error('Failed to export CSV. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    onSaveComplete();
  };

  const handleExportAll = () => {
    setIsExporting(true);
    try {
      const leadsToExport = allData.map((row) => ({
        email: row[emailColumn].toLowerCase().trim(),
        display_name: row['name'] || row['first_name'] || row['full_name'] || row[emailColumn],
        campaigns: [campaignName],
        date_added: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        source_data: row,
      })) as Lead[];
      
      const csvBlob = exportToCSV(leadsToExport, 'all', '');
      const filename = `${campaignName.toLowerCase().replace(/\s+/g, '-')}-all-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadBlob(csvBlob, filename);
      
      toast.success('All leads exported successfully!');
    } catch (error) {
      toast.error('Failed to export leads.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportNewOnly = () => {
    if (newLeads.length === 0) {
      toast.error('No new leads to export.');
      return;
    }

    setIsExporting(true);
    try {
      // Export only new leads (duplicates removed) in original CSV format
      const csvBlob = exportToCSV(
        newLeads.map((row) => ({
          email: row[emailColumn],
          display_name: row['name'] || row['first_name'] || '',
          campaigns: [],
          date_added: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          source_data: row,
        })) as Lead[],
        'all',
        ''
      );
      
      const filename = `${campaignName.toLowerCase().replace(/\s+/g, '-')}-duplicates-removed-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadBlob(csvBlob, filename);
      
      toast.success(`Exported ${newLeads.length} unique leads (${duplicates.length} duplicates removed)`);
    } catch (error) {
      toast.error('Failed to export leads.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">✓ Complete!</CardTitle>
          <CardDescription>
            Leads saved to database and ready to export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-sm">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {newLeads.length.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                New Leads Saved
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-sm">
              <div className="text-5xl font-bold text-red-600 mb-2">
                {duplicates.length.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                Duplicates Skipped
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <span className="block">✓ {newLeads.length.toLocaleString()} new leads saved to database</span>
              <span className="block">✓ {duplicates.length.toLocaleString()} duplicate emails skipped</span>
              <span className="block">✓ Clean CSV ready to download</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleExportCleanCSV}
              disabled={isSaving}
              size="lg"
              className="flex-1 h-14 text-base font-semibold"
            >
              <Download className="mr-2 h-5 w-5" />
              {isSaving ? 'Downloading...' : 'Download Clean CSV'}
            </Button>
            <Button
              onClick={handleStartOver}
              variant="outline"
              size="lg"
              className="h-14 text-base font-semibold sm:w-auto w-full"
            >
              Upload Another
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optional: View Details */}
      {(newLeads.length > 0 || duplicates.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
            <CardDescription>
              Review what was processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newLeads.length > 0 && (
                <div>
                  <h3 className="font-medium text-green-600 mb-2">✓ New Leads Added ({newLeads.length})</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {newLeads.slice(0, 5).map((lead, idx) => (
                      <div key={idx}>• {lead[emailColumn]}</div>
                    ))}
                    {newLeads.length > 5 && (
                      <div className="text-gray-500 italic">...and {newLeads.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
              
              {duplicates.length > 0 && (
                <div>
                  <h3 className="font-medium text-red-600 mb-2">✗ Duplicates Skipped ({duplicates.length})</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {duplicates.slice(0, 5).map((lead, idx) => (
                      <div key={idx}>• {lead.email}</div>
                    ))}
                    {duplicates.length > 5 && (
                      <div className="text-gray-500 italic">...and {duplicates.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

