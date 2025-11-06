'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Lead } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { downloadBlob } from '@/lib/helpers';

const PAGE_SIZE = 50;

export default function DatabasePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    campaigns: [] as string[],
  });

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadLeads();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    // We can load stats less frequently or when total count changes
    loadStats();
  }, [totalCount]);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * PAGE_SIZE;

      // **Major Fix**: Calling the new database function `search_leads` via RPC.
      // This handles all searching and pagination efficiently on the server.
      const { data, error } = await supabase.rpc('search_leads', {
        search_term: debouncedSearch,
        page_limit: PAGE_SIZE,
        page_offset: offset,
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      const leads = data || [];
      const newTotalCount = leads.length > 0 ? leads[0].total_count : 0;

      setLeads(leads);
      setTotalCount(newTotalCount);

    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  const loadStats = useCallback(async () => {
    try {
      // Get total count and campaigns efficiently
      const { data, error } = await supabase
        .from('leads')
        .select('campaigns')
        .limit(1000); // Limit for performance

      if (error) throw error;

      const allCampaigns = new Set<string>();
      data?.forEach(lead => {
        lead.campaigns?.forEach((c: string) => allCampaigns.add(c));
      });

      setStats({
        total: totalCount,
        campaigns: Array.from(allCampaigns).sort(),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [totalCount]);

  // This is no longer needed as filtering is done on the server.
  // const filteredLeads = useMemo(() => {
  //   return leads;
  // }, [leads]);

  const handleExportAll = async () => {
    try {
      setIsLoading(true);
      toast.info("Preparing your export... this may take a moment.")
      
      // Fetch ALL leads matching the search term for export by calling the RPC with a large limit.
      const { data, error } = await supabase.rpc('search_leads', {
        search_term: debouncedSearch,
        page_limit: 100000, // A large number to get all results
        page_offset: 0
      });

      if (error) throw error;

      const leadsToExport = data || [];

      if (leadsToExport.length === 0) {
        toast.info("No leads to export for the current search.");
        setIsLoading(false);
        return;
      }

      const csvData = leadsToExport.map(lead => ({
        email: lead.email,
        display_name: lead.display_name,
        campaigns: lead.campaigns.join('; '),
        date_added: lead.date_added,
        last_updated: lead.last_updated,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const filename = `master-database-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadBlob(blob, filename);
      
      toast.success(`Exported ${leadsToExport.length} leads`);
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (email: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('email', email);

      if (error) throw error;

      toast.success('Lead deleted');
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Master Database</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          View and search all leads in your database
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{totalCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">{stats.campaigns.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
              Showing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{leads.length.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Search by email, domain (e.g., @gmail.com), name, or campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 relative min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, domain, name, or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadLeads} variant="outline" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExportAll} variant="default" disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Export ({totalCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            {totalCount.toLocaleString()} {totalCount === 1 ? 'lead' : 'leads'} found
            {totalCount > PAGE_SIZE && ` (Page ${currentPage} of ${totalPages})`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery ? 'No leads match your search' : 'No leads in database yet'}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Campaigns
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Date Added
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.email} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium max-w-xs truncate" title={lead.email}>
                              {lead.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-700 dark:text-gray-300 max-w-xs truncate" title={lead.display_name || undefined}>
                              {lead.display_name || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {lead.campaigns.slice(0, 2).map((campaign, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {campaign}
                                </Badge>
                              ))}
                              {lead.campaigns.length > 2 && (
                                <Badge variant="outline" className="text-xs" title={lead.campaigns.join(', ')}>
                                  +{lead.campaigns.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {format(new Date(lead.date_added), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => handleDeleteLead(lead.email)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} leads
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center px-3 text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign List */}
      {stats.campaigns.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              {stats.campaigns.length} {stats.campaigns.length === 1 ? 'campaign' : 'campaigns'} tracked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.campaigns.map((campaign, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={() => {
                    setSearchQuery(campaign);
                    setCurrentPage(1);
                  }}
                >
                  {campaign}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

