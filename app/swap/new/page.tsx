'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSwapSchema, CreateSwapFormData } from '@/lib/validations';
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

interface PurdueCourse {
  Subject: string;
  Number: string;
  Title: string;
}

export default function CreateSwapPage() {
  const { user, canCreateSwaps } = useAuth();
  const router = useRouter();
  const [courseSearch, setCourseSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PurdueCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<PurdueCourse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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

  // Search courses from Purdue.io API
  const searchCourses = async (query: string) => {
    if (query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.purdue.io/odata/Courses?$filter=contains(Title, '${query}') or (Subject eq '${query.toUpperCase()}')&$top=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.value || []);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      // Fallback to mock data if API fails
      const mockCourses = [
        { Subject: 'CS', Number: '18000', Title: 'Problem Solving and Object-Oriented Programming' },
        { Subject: 'CS', Number: '24000', Title: 'Programming in C' },
        { Subject: 'MATH', Number: '26100', Title: 'Multivariate Calculus' },
        { Subject: 'MATH', Number: '35100', Title: 'Elementary Linear Algebra' },
        { Subject: 'ENGL', Number: '10600', Title: 'First-Year Composition' }
      ];
      setSearchResults(mockCourses.filter(course => 
        course.Title.toLowerCase().includes(query.toLowerCase()) ||
        course.Subject.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  };

  // Handle course search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (courseSearch.length >= 3) {
        searchCourses(courseSearch);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [courseSearch]);

  const handleCourseSelect = (course: PurdueCourse) => {
    setSelectedCourse(course);
    setValue('course_id', `${course.Subject}-${course.Number}`);
    setCourseSearch('');
    setSearchResults([]);
  };

  const addDesiredCrn = () => {
    if (desiredCrns.length < 3) {
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create the swap request (mock for demo)
      const newSwapRequest = {
        id: `swap-${Date.now()}`,
        current_crn: data.current_crn,
        desired_crns: data.desired_crns,
        time_window: data.time_window || null,
        campus: data.campus,
        term: data.term,
        status: 'open',
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        courses: selectedCourse || {
          subject: 'Unknown',
          number: '00000',
          title: 'Unknown Course'
        },
        users: {
          name: user.name || 'Current User',
          major: 'Computer Science',
          year: 'Senior'
        },
        offers_count: 0
      };

      // Save to localStorage for demo
      const existingSwaps = JSON.parse(localStorage.getItem(`user_swaps_${user.id}`) || '[]');
      const updatedSwaps = [newSwapRequest, ...existingSwaps];
      localStorage.setItem(`user_swaps_${user.id}`, JSON.stringify(updatedSwaps));

      // Simulate success
      alert('Swap request created successfully! (This is a demo)');
      
      // Redirect to dashboard to see the new request
      router.push('/dashboard');
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

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Demo Mode:</strong> This form uses real Purdue.io API for course search but saves to mock data.
          </p>
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
                  <div className="relative">
                    <Input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search for course (e.g., CS 180, Mathematics, Algebra)"
                      className="pr-10"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((course, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleCourseSelect(course)}
                        >
                          <div className="font-medium">
                            {course.Subject} {course.Number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {course.Title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedCourse && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="secondary">
                        {selectedCourse.Subject} {selectedCourse.Number}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {selectedCourse.Title}
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
                  Desired CRNs * (1-3)
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
                  {desiredCrns.length < 3 && (
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
                <Button type="submit" disabled={isSubmitting || !selectedCourse}>
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