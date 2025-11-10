'use client';

import { useState } from 'react';
import { UploadCSV } from '@/components/upload-csv';
import { DuplicateResults } from '@/components/duplicate-results';
import { checkDuplicates, saveLeads } from '@/lib/helpers';
import { Lead, CSVRow } from '@/lib/types';
import { toast } from 'sonner';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<{
    validLeads: CSVRow[];
    invalidEmails: string[];
    emailColumn: string;
    campaignName: string;
    allData: CSVRow[];
  } | null>(null);
  
  const [duplicateResults, setDuplicateResults] = useState<{
    newLeads: CSVRow[];
    duplicates: Lead[];
  } | null>(null);
  
  const [isChecking, setIsChecking] = useState(false);

  const handleUploadComplete = async (data: {
    validLeads: CSVRow[];
    invalidEmails: string[];
    emailColumn: string;
    campaignName: string;
    allData: CSVRow[];
  }) => {
    setUploadData(data);
    setIsChecking(true);

    try {
      // Check for duplicates
      const result = await checkDuplicates(
        data.validLeads.map(row => row[data.emailColumn]),
        data.validLeads,
        data.emailColumn
      );
      
      setDuplicateResults(result);
      
      // Automatically save new leads to database
      if (result.newLeads.length > 0) {
        console.log('Attempting to save leads:', {
          count: result.newLeads.length,
          emailColumn: data.emailColumn,
          campaignName: data.campaignName,
          firstLead: result.newLeads[0]
        });
        
        const saveResult = await saveLeads(result.newLeads, data.emailColumn, data.campaignName);
        
        console.log('Save result:', saveResult);
        
        toast.success(
          `✓ ${result.newLeads.length} new leads saved to database! ${result.duplicates.length} duplicates skipped.`
        );
      } else {
        toast.info('All leads were duplicates. Nothing new to add.');
      }
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
      console.error('Processing error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveComplete = () => {
    // Reset the form
    setUploadData(null);
    setDuplicateResults(null);
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Upload Leads</h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
              Automatically removes duplicates and adds new leads to your database
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Drop your file → We check for duplicates → Download clean CSV
            </p>
          </div>

      {isChecking && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100 mx-auto mb-4"></div>
            <p className="text-base font-medium mb-1 text-gray-900 dark:text-gray-100">Processing your leads...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Checking duplicates and saving to database</p>
          </div>
        </div>
      )}

      {!isChecking && !duplicateResults && (
        <UploadCSV onUploadComplete={handleUploadComplete} />
      )}

      {!isChecking && duplicateResults && uploadData && (
        <DuplicateResults
          newLeads={duplicateResults.newLeads}
          duplicates={duplicateResults.duplicates}
          emailColumn={uploadData.emailColumn}
          campaignName={uploadData.campaignName}
          allData={uploadData.allData}
          onSaveComplete={handleSaveComplete}
        />
      )}
    </div>
  );
}
