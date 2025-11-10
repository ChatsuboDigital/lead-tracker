'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead } from '@/lib/types';
import { LeadDetailModal } from './lead-detail-modal';

interface LeadTableProps {
  leads: Lead[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLeadUpdate: () => void;
  selectedLeads: string[];
  onSelectionChange: (emails: string[]) => void;
}

export function LeadTable({
  leads,
  currentPage,
  totalPages,
  onPageChange,
  onLeadUpdate,
  selectedLeads,
  onSelectionChange,
}: LeadTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortColumn, setSortColumn] = useState<'email' | 'display_name' | 'date_added'>('date_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: 'email' | 'display_name' | 'date_added') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    if (sortColumn === 'date_added') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = (aValue || '').toLowerCase();
      bValue = (bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(leads.map(l => l.email));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (email: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeads, email]);
    } else {
      onSelectionChange(selectedLeads.filter(e => e !== email));
    }
  };

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
        <p className="text-gray-600 dark:text-gray-400 text-base">No leads found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-800">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/30 text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => handleSort('email')}
              >
                Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/30 text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => handleSort('display_name')}
              >
                Display Name {sortColumn === 'display_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-sm font-medium text-gray-700 dark:text-gray-300">Campaigns</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/30 text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => handleSort('date_added')}
              >
                Date Added {sortColumn === 'date_added' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead) => (
              <TableRow key={lead.email} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(lead.email)}
                    onCheckedChange={(checked) => handleSelectLead(lead.email, checked as boolean)}
                    aria-label={`Select ${lead.email}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.email}</TableCell>
                <TableCell>{lead.display_name || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {lead.campaigns.slice(0, 3).map((campaign) => (
                      <Badge key={campaign} variant="secondary" className="text-xs">
                        {campaign}
                      </Badge>
                    ))}
                    {lead.campaigns.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{lead.campaigns.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{format(new Date(lead.date_added), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="border-gray-200 dark:border-gray-800"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-200 dark:border-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={currentPage === pageNum ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200' : 'border-gray-200 dark:border-gray-800'}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-200 dark:border-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="border-gray-200 dark:border-gray-800"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={onLeadUpdate}
        />
      )}
    </>
  );
}

