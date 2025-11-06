'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSupabaseError } from '@/lib/supabase';

export function SupabaseErrorBoundary({ children }: { children: React.ReactNode }) {
  const error = getSupabaseError();

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Configuration Error</CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              Missing Supabase configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-sm mb-2 text-red-900 dark:text-red-100">
                  How to fix:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-red-800 dark:text-red-200">
                  <li>Go to your Vercel project settings</li>
                  <li>Navigate to Environment Variables</li>
                  <li>Add these two variables:
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
                      <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon key</li>
                    </ul>
                  </li>
                  <li>Redeploy your application</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

