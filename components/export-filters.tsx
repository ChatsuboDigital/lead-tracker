'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Tag, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lead, SearchFilters } from '@/lib/types';
import { searchLeads, getAllCampaigns, exportToCSV, downloadBlob, addCampaignToLeads } from '@/lib/helpers';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ExportFilters() {
  const [allCampaigns, setAllCampaigns] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [excludedCampaigns, setExcludedCampaigns] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportFormat, setExportFormat] = useState<'all' | 'core' | 'email-only'>('all');
  const [filename, setFilename] = useState('leads-export');
  const [tagWithCampaign, setTagWithCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  
  const [previewLeads, setPreviewLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    loadPreview();
  }, [selectedCampaigns, excludedCampaigns, startDate, endDate, searchQuery]);

  const loadCampaigns = async () => {
    try {
      const campaigns = await getAllCampaigns();
      setAllCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadPreview = async () => {
    setIsLoading(true);
    try {
      const filters: SearchFilters = {
        query: searchQuery,
        campaigns: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
        excludeCampaigns: excludedCampaigns.length > 0 ? excludedCampaigns : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: 1,
        pageSize: 5,
      };

      const result = await searchLeads(filters);
      setPreviewLeads(result.leads);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCampaign = (campaign: string, isInclude: boolean) => {
    if (isInclude) {
      if (selectedCampaigns.includes(campaign)) {
        setSelectedCampaigns(selectedCampaigns.filter(c => c !== campaign));
      } else {
        setSelectedCampaigns([...selectedCampaigns, campaign]);
      }
    } else {
      if (excludedCampaigns.includes(campaign)) {
        setExcludedCampaigns(excludedCampaigns.filter(c => c !== campaign));
      } else {
        setExcludedCampaigns([...excludedCampaigns, campaign]);
      }
    }
  };

  const handleExport = async () => {
    if (totalCount === 0) {
      toast.error('No leads match your filters');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all matching leads (not just preview)
      const filters: SearchFilters = {
        query: searchQuery,
        campaigns: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
        excludeCampaigns: excludedCampaigns.length > 0 ? excludedCampaigns : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: 1,
        pageSize: totalCount, // Get all results
      };

      const result = await searchLeads(filters);
      
      // Tag with campaign if requested
      if (tagWithCampaign && newCampaignName.trim()) {
        await addCampaignToLeads(
          result.leads.map(l => l.email),
          newCampaignName.trim()
        );
        toast.success(`Tagged ${result.leads.length} leads with campaign "${newCampaignName}"`);
      }

      // Export to CSV
      const csvBlob = exportToCSV(result.leads, exportFormat, filename);
      const exportFilename = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadBlob(csvBlob, exportFilename);

      toast.success(`Exported ${result.leads.length} leads successfully!`);
    } catch (error) {
      toast.error('Failed to export leads');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Export Filters</CardTitle>
          <CardDescription>
            Configure filters to select which leads to export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search by Email</Label>
            <Input
              id="search"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Separator />

          {/* Include Campaigns */}
          <div className="space-y-2">
            <Label>Include Campaigns</Label>
            <p className="text-sm text-gray-500">
              Select campaigns to include. Leads must be in at least one of these campaigns.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {allCampaigns.map((campaign) => (
                <Badge
                  key={campaign}
                  variant={selectedCampaigns.includes(campaign) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleToggleCampaign(campaign, true)}
                >
                  {campaign}
                  {selectedCampaigns.includes(campaign) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Exclude Campaigns */}
          <div className="space-y-2">
            <Label>Exclude Campaigns</Label>
            <p className="text-sm text-gray-500">
              Select campaigns to exclude. Leads in any of these campaigns will be filtered out.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {allCampaigns.map((campaign) => (
                <Badge
                  key={campaign}
                  variant={excludedCampaigns.includes(campaign) ? 'destructive' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleToggleCampaign(campaign, false)}
                >
                  {campaign}
                  {excludedCampaigns.includes(campaign) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${totalCount} leads match your filters`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : previewLeads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No leads match your filters</p>
          ) : (
            <div className="space-y-2">
              {previewLeads.map((lead) => (
                <div
                  key={lead.email}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{lead.email}</p>
                    {lead.display_name && (
                      <p className="text-sm text-gray-500">{lead.display_name}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.campaigns.slice(0, 2).map((campaign) => (
                      <Badge key={campaign} variant="secondary" className="text-xs">
                        {campaign}
                      </Badge>
                    ))}
                    {lead.campaigns.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{lead.campaigns.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {totalCount > 5 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  ...and {totalCount - 5} more leads
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Configure how to export your leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields (includes source data)</SelectItem>
                <SelectItem value="core">Core Fields Only (email, name, campaigns, dates)</SelectItem>
                <SelectItem value="email-only">Email Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename (without .csv)</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="leads-export"
            />
          </div>

          {/* Tag with Campaign */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tag-campaign"
                checked={tagWithCampaign}
                onCheckedChange={(checked) => setTagWithCampaign(checked as boolean)}
              />
              <Label htmlFor="tag-campaign" className="cursor-pointer">
                Tag exported leads with new campaign
              </Label>
            </div>
            {tagWithCampaign && (
              <Input
                placeholder="Enter campaign name"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
              />
            )}
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || totalCount === 0}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : `Download CSV (${totalCount} leads)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

