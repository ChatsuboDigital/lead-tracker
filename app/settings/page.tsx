'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Trash2, Database, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [leadCount, setLeadCount] = useState<number | null>(null);

  const checkLeadCount = async () => {
    try {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setLeadCount(count || 0);
    } catch (error) {
      console.error('Error checking lead count:', error);
      toast.error('Failed to check database status');
    }
  };

  const handleClearDatabase = async () => {
    if (confirmText !== 'DELETE ALL LEADS') {
      toast.error('Please type "DELETE ALL LEADS" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all leads from Supabase
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('email', ''); // This will match all rows

      if (error) throw error;

      toast.success('Database cleared successfully!');
      setShowConfirm(false);
      setConfirmText('');
      setLeadCount(0);
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('Failed to clear database. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowConfirm = async () => {
    await checkLeadCount();
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmText('');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Settings</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage your application settings and database
        </p>
      </div>

      {/* Database Management */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Database Management</CardTitle>
          </div>
          <CardDescription>
            Danger zone - These actions cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showConfirm ? (
            <>
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Clear All Leads
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      This will permanently delete all leads from your database. This action cannot be undone.
                      All lead data, campaigns, and history will be lost.
                    </p>
                    <Button
                      onClick={handleShowConfirm}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Database
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 dark:border-red-600 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 dark:text-red-100 text-lg mb-2">
                      ⚠️ Are you absolutely sure?
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                      This will permanently delete <strong>{leadCount?.toLocaleString() || 0} leads</strong> from your database.
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                      This action cannot be undone. All data will be lost forever.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="confirm-text" className="text-red-900 dark:text-red-100 font-semibold">
                      Type "DELETE ALL LEADS" to confirm
                    </Label>
                    <Input
                      id="confirm-text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE ALL LEADS"
                      className="mt-2 border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleClearDatabase}
                      disabled={isDeleting || confirmText !== 'DELETE ALL LEADS'}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Lead Deduplicator</strong> - Smart lead management and deduplication tool
            </p>
            <p>
              Version 1.0.0
            </p>
            <p className="pt-2 border-t">
              Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



