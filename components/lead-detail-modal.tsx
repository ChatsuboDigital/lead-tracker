'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, Save, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lead } from '@/lib/types';
import { updateLeadNotes, deleteLeads } from '@/lib/helpers';
import { toast } from 'sonner';

interface LeadDetailModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function LeadDetailModal({ lead, open, onClose, onUpdate }: LeadDetailModalProps) {
  const [notes, setNotes] = useState(lead.source_data?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateLeadNotes(lead.email, notes);
      toast.success('Notes saved successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to save notes');
      console.error('Save notes error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLeads([lead.email]);
      toast.success('Lead deleted successfully');
      setShowDeleteDialog(false);
      onClose();
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete lead');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter out notes from source_data for display
  const displaySourceData = Object.entries(lead.source_data || {})
    .filter(([key]) => key !== 'notes')
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>{lead.email}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{lead.email}</p>
                </div>
                
                {lead.display_name && (
                  <div>
                    <Label className="text-xs text-gray-500">Display Name</Label>
                    <p className="font-medium">{lead.display_name}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-500">Date Added</Label>
                  <p>{format(new Date(lead.date_added), 'MMMM d, yyyy h:mm a')}</p>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <p>{format(new Date(lead.last_updated), 'MMMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <Separator />

              {/* Campaigns */}
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">
                  Campaigns ({lead.campaigns.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {lead.campaigns.map((campaign) => (
                    <Badge key={campaign} variant="secondary">
                      {campaign}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Source Data */}
              {displaySourceData.length > 0 && (
                <>
                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Source Data</Label>
                    <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {displaySourceData.map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 break-words">
                            {key}
                          </p>
                          <p className="text-sm col-span-2 break-words">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  size="sm"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </ScrollArea>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Lead
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Lead</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="font-medium">{lead.email}</p>
              {lead.display_name && (
                <p className="text-sm text-gray-500">{lead.display_name}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

