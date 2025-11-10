'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSV, detectEmailColumn, findAllEmailColumns, extractCampaignName, validateEmail } from '@/lib/helpers';
import { CSVRow } from '@/lib/types';
import { toast } from 'sonner';

interface UploadCSVProps {
  onUploadComplete: (data: {
    validLeads: CSVRow[];
    invalidEmails: string[];
    emailColumn: string;
    campaignName: string;
    allData: CSVRow[];
  }) => void;
}

export function UploadCSV({ onUploadComplete }: UploadCSVProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [emailColumn, setEmailColumn] = useState<string>('');
  const [availableEmailColumns, setAvailableEmailColumns] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Invalid file format. Please upload a CSV file.');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setIsProcessing(true);
    setFile(selectedFile);

    try {
      const { data, headers: csvHeaders } = await parseCSV(selectedFile);
      
      if (data.length === 0) {
        toast.error('CSV file is empty.');
        setIsProcessing(false);
        return;
      }

      setCsvData(data);
      setHeaders(csvHeaders);

      // Extract campaign name from filename
      const extractedCampaign = extractCampaignName(selectedFile.name);
      setCampaignName(extractedCampaign);

      // Detect email column
      const detectedColumn = detectEmailColumn(csvHeaders);
      const allEmailColumns = findAllEmailColumns(csvHeaders);

      if (!detectedColumn && allEmailColumns.length === 0) {
        toast.error('No email column detected. Please check your CSV file.');
        setIsProcessing(false);
        return;
      }

      setAvailableEmailColumns(allEmailColumns);
      
      if (allEmailColumns.length === 1) {
        setEmailColumn(allEmailColumns[0]);
        validateEmails(data, allEmailColumns[0]);
        setShowPreview(true);
      } else if (detectedColumn) {
        setEmailColumn(detectedColumn);
        validateEmails(data, detectedColumn);
        setShowPreview(true);
      } else {
        // Multiple email columns found, let user select
        setShowPreview(true);
        toast.info('Multiple email columns found. Please select one.');
      }

      toast.success(`Loaded ${data.length} rows from CSV`);
    } catch (error) {
      toast.error('Failed to parse CSV file. Please check the file format.');
      console.error('CSV parsing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateEmails = (data: CSVRow[], column: string) => {
    let valid = 0;
    let invalid = 0;

    data.forEach((row) => {
      const email = row[column]?.trim();
      if (email && validateEmail(email)) {
        valid++;
      } else {
        invalid++;
      }
    });

    setValidCount(valid);
    setInvalidCount(invalid);
  };

  const handleEmailColumnChange = (value: string) => {
    setEmailColumn(value);
    validateEmails(csvData, value);
  };

  const handleProcessClick = () => {
    if (!emailColumn) {
      toast.error('Please select an email column');
      return;
    }
    if (!campaignName.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    processFile(emailColumn, campaignName);
  };

  const processFile = (column: string, campaign: string) => {
    if (!column || !campaign.trim()) {
      return;
    }

    const validLeads = csvData.filter((row) => {
      const email = row[column]?.trim();
      return email && validateEmail(email);
    });

    const invalidEmails = csvData
      .filter((row) => {
        const email = row[column]?.trim();
        return !email || !validateEmail(email);
      })
      .map((row) => row[column] || 'empty');

    onUploadComplete({
      validLeads,
      invalidEmails,
      emailColumn: column,
      campaignName: campaign.trim(),
      allData: csvData,
    });
  };

  const resetUpload = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setEmailColumn('');
    setAvailableEmailColumns([]);
    setCampaignName('');
    setValidCount(0);
    setInvalidCount(0);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Upload CSV File</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Drag and drop your CSV file or click to browse. Maximum file size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-base font-medium mb-2 text-gray-900 dark:text-gray-100">
                  {isProcessing ? 'Processing...' : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">or click to browse</p>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Review & Configure</CardTitle>
                  <CardDescription className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{file?.name}</span>
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div>• {csvData.length.toLocaleString()} total rows</div>
                      <div>• {headers.length} columns detected</div>
                      <div>• {((file?.size || 0) / 1024).toFixed(2)} KB file size</div>
                    </div>
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={resetUpload} className="border-gray-200 dark:border-gray-800">
                  Upload Different File
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name" className="text-base font-semibold">
                  Campaign Name *
                </Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer 2024 Campaign"
                  className="text-base"
                />
                <p className="text-xs text-gray-500">
                  This name will be used to track where these leads came from
                </p>
              </div>

              {/* Email Column Selection */}
              {availableEmailColumns.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="email-column" className="text-base font-semibold">
                    Select Email Column *
                  </Label>
                  <Select value={emailColumn} onValueChange={handleEmailColumnChange}>
                    <SelectTrigger id="email-column" className="text-base">
                      <SelectValue placeholder="Choose email column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmailColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Validation Stats */}
              {emailColumn && (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gray-700 dark:text-gray-300 shrink-0" />
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-lg font-semibold">{validCount.toLocaleString()}</span> valid emails
                    </span>
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-500 shrink-0" />
                      <span className="font-medium text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-lg font-semibold">{invalidCount.toLocaleString()}</span> invalid emails
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {emailColumn && csvData.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview (First 5 Rows)</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 z-10">
                          <tr>
                            {headers.map((header) => (
                              <th
                                key={header}
                                className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm border-b border-gray-200 dark:border-gray-800"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{header}</span>
                                  {header === emailColumn && (
                                    <Badge variant="secondary" className="text-xs shrink-0 bg-gray-100 dark:bg-gray-800">
                                      Email
                                    </Badge>
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                              {headers.map((header) => (
                                <td key={header} className="px-3 py-2 whitespace-nowrap">
                                  <div className="max-w-xs truncate" title={row[header]}>
                                    {row[header]}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Showing first 5 of {csvData.length.toLocaleString()} rows • Scroll to see all columns • Hover to see full text
                  </p>
                </div>
              )}

              {/* Process Button */}
              {emailColumn && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    onClick={handleProcessClick}
                    disabled={!campaignName.trim() || validCount === 0}
                    size="lg"
                    className="w-full h-12 text-base bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                  >
                    Process {validCount} Leads
                  </Button>
                  {!campaignName.trim() && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Please enter a campaign name to continue
                    </p>
                  )}
                  {validCount === 0 && campaignName.trim() && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      No valid emails found in selected column
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

