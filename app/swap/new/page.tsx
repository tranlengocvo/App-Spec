'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createSwapSchema, CreateSwapFormData } from '@/lib/validations';
import { searchCourses, parseCourseInput, CourseWithSections } from '@/lib/purdue-api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X, Search } from 'lucide-react';

export default function CreateSwapPage() {
  const { user, canCreateSwaps } = useAuth();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithSections | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [desiredCrns, setDesiredCrns] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSwapFormData>({
    resolver: zodResolver(createSwapSchema),
  });

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (user === null) {
      router.push('/signin');
      return;
    }
    if (user && !canCreateSwaps) {
      router.push('/');
      return;
    }
  }, [user, canCreateSwaps, router]);

  // Search for course
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['courseSearch', courseSearch],
    queryFn: () => {
      const parsed = parseCourseInput(courseSearch);
      return parsed ? searchCourses(parsed.subject, parsed.number) : null;
    },
    enabled: !!courseSearch && courseSearch.length > 3,
  });

  const handleCourseSelect = (course: CourseWithSections) => {
    setSelectedCourse(course);
    setValue('course_id', course.id);
    setCourseSearch('');
  };

  const addDesiredCrn = () => {
    if (desiredCrns.length < 5) {
      setDesiredCrns([...desiredCrns, '']);
    }
  };

  const removeDesiredCrn = (index: number) => {
    if (desiredCrns.length > 1) {
      const newCrns = desiredCrns.filter((_, i) => i !== index);
      setDesiredCrns(newCrns);
      setValue('desired_crns', newCrns.filter(crn => crn.trim() !== ''));
    }
  };

  const updateDesiredCrn = (index: number, value: string) => {
    const newCrns = [...desiredCrns];
    newCrns[index] = value;
    setDesiredCrns(newCrns);
    setValue('desired_crns', newCrns.filter(crn => crn.trim() !== ''));
  };

  const onSubmit = async (data: CreateSwapFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Check for duplicate open swap request
      const { data: existingSwap, error: checkError } = await supabase
        .from('swap_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', data.course_id)
        .eq('current_crn', data.current_crn)
        .eq('status', 'open')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSwap) {
        setError('You already have an open swap request for this course and CRN');
        setIsSubmitting(false);
        return;
      }

      // Create the swap request
      const { data: swapRequest, error: createError } = await supabase
        .from('swap_requests')
        .insert({
          user_id: user.id,
          course_id: data.course_id,
          current_crn: data.current_crn,
          desired_crns: data.desired_crns,
          term: data.term,
          campus: data.campus,
          time_window: data.time_window || null,
          notes: data.notes || null,
          status: 'open',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Redirect to the swap detail page
      router.push(`/swap/${swapRequest.id}`);
    } catch (err) {
      console.error('Error creating swap:', err);
      setError(err instanceof Error ? err.message : 'Failed to create swap request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !canCreateSwaps) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need to be signed in with a verified Purdue email to create swap requests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Swap Request</h1>
          <p className="text-gray-600">Request to swap your current class section with other students.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Swap Details</CardTitle>
            <CardDescription>
              Fill in the details of the class you want to swap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search for course (e.g., CS 180)"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" disabled={!courseSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isSearching && (
                    <div className="text-sm text-gray-500">Searching...</div>
                  )}
                  
                  {searchResults && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {searchResults.subject} {searchResults.number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {searchResults.title}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCourseSelect(searchResults)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="secondary">
                        {selectedCourse.subject} {selectedCourse.number}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {selectedCourse.title}
                      </span>
                    </div>
                  )}
                </div>
                {errors.course_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.course_id.message}</p>
                )}
              </div>

              {/* Current CRN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current CRN *
                </label>
                <Input
                  {...register('current_crn')}
                  placeholder="12345"
                  maxLength={5}
                />
                {errors.current_crn && (
                  <p className="text-sm text-red-600 mt-1">{errors.current_crn.message}</p>
                )}
              </div>

              {/* Desired CRNs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired CRNs * (1-5)
                </label>
                <div className="space-y-2">
                  {desiredCrns.map((crn, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={crn}
                        onChange={(e) => updateDesiredCrn(index, e.target.value)}
                        placeholder="12345"
                        maxLength={5}
                        className="flex-1"
                      />
                      {desiredCrns.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDesiredCrn(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {desiredCrns.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDesiredCrn}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add CRN</span>
                    </Button>
                  )}
                </div>
                {errors.desired_crns && (
                  <p className="text-sm text-red-600 mt-1">{errors.desired_crns.message}</p>
                )}
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term *
                </label>
                <Select onValueChange={(value) => setValue('term', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                    <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                  </SelectContent>
                </Select>
                {errors.term && (
                  <p className="text-sm text-red-600 mt-1">{errors.term.message}</p>
                )}
              </div>

              {/* Campus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus *
                </label>
                <Select onValueChange={(value) => setValue('campus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="West Lafayette">West Lafayette</SelectItem>
                    <SelectItem value="Fort Wayne">Fort Wayne</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="Purdue Global">Purdue Global</SelectItem>
                  </SelectContent>
                </Select>
                {errors.campus && (
                  <p className="text-sm text-red-600 mt-1">{errors.campus.message}</p>
                )}
              </div>

              {/* Time Window */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time Window
                </label>
                <Input
                  {...register('time_window')}
                  placeholder="e.g., Morning classes, After 2 PM, etc."
                />
                {errors.time_window && (
                  <p className="text-sm text-red-600 mt-1">{errors.time_window.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  {...register('notes')}
                  placeholder="Any additional information about your swap request..."
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Swap Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
