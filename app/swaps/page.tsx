'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import SwapCard, { SwapCardData } from '@/components/SwapCard';
import FiltersBar, { FilterState } from '@/components/FiltersBar';
import Pagination from '@/components/Pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 14;

function SwapsPageContent() {
  const { user, canCreateSwaps } = useAuth();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    subject: '',
    number: '',
    onlyOpen: true,
  });

  // Initialize filters from URL params
  useEffect(() => {
    const course = searchParams.get('course');
    if (course) {
      const [subject, number] = course.split(' ');
      setFilters(prev => ({
        ...prev,
        subject: subject || '',
        number: number || '',
      }));
    }
  }, [searchParams]);

  const { data: swapsData, isLoading, error, refetch } = useQuery({
    queryKey: ['swaps', currentPage, filters],
    queryFn: async () => {
      let query = supabase
        .from('swap_requests')
        .select(`
          id,
          current_crn,
          desired_crns,
          time_window,
          campus,
          term,
          status,
          created_at,
          courses!inner (
            id,
            subject,
            number,
            title
          ),
          users!inner (
            name,
            major,
            year
          ),
          offers (
            id
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.subject) {
        query = query.eq('courses.subject', filters.subject);
      }
      if (filters.number) {
        query = query.eq('courses.number', filters.number);
      }
      if (filters.onlyOpen) {
        query = query.eq('status', 'open');
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform data to match SwapCardData interface
      const transformedData = data?.map(swap => ({
        id: swap.id,
        course: {
          subject: swap.courses[0]?.subject,
          number: swap.courses[0]?.number,
          title: swap.courses[0]?.title,
        },
        user: {
          name: swap.users[0]?.name,
          major: swap.users[0]?.major,
          year: swap.users[0]?.year,
        },
        current_crn: swap.current_crn,
        desired_crns: swap.desired_crns,
        time_window: swap.time_window,
        campus: swap.campus,
        term: swap.term,
        status: swap.status,
        offers_count: swap.offers?.length || 0,
        created_at: swap.created_at,
      })) || [];

      return {
        swaps: transformedData,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      subject: '',
      number: '',
      onlyOpen: true,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load swaps
                </h3>
                <p className="text-gray-600 mb-4">
                  There was an error loading the swap requests. Please try again.
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { swaps, totalCount, totalPages } = swapsData || { swaps: [], totalCount: 0, totalPages: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Class Swaps
            </h1>
            <p className="text-gray-600">
              Find and swap classes with other Purdue students
            </p>
          </div>
          {canCreateSwaps && (
            <Link href="/swap/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Swap</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* Results */}
        {swaps.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No swaps found
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.subject || filters.number || filters.onlyOpen
                    ? 'Try adjusting your filters to see more results.'
                    : 'Be the first to create a swap request!'}
                </p>
                {canCreateSwaps && (
                  <Link href="/swap/new">
                    <Button>Create Swap Request</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {swaps.length} of {totalCount} swap{totalCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Swaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {swaps.map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalCount}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function SwapsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SwapsPageContent />
    </Suspense>
  );
}
