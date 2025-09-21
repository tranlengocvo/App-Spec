'use client';

import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import CourseSearch from '@/components/CourseSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, canCreateSwaps, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#CFB991]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-black/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-black/20 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-black/20 rounded"></div>
              <div className="h-64 bg-black/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#CFB991]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="bg-black p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                {/* Left Speech Bubble - Graduation Cap */}
                <div className="relative">
                  <div className="w-12 h-8 bg-[#CFB991] rounded-lg relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#CFB991]"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-6 h-4 bg-black rounded-sm"></div>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-black"></div>
                      <div className="absolute top-0 right-0 w-1 h-3 bg-black"></div>
                    </div>
                  </div>
                </div>
                
                {/* Circular Arrows */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 border-2 border-[#CFB991] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#CFB991] transform rotate-45"></div>
                  </div>
                  <div className="w-6 h-6 border-2 border-[#CFB991] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#CFB991] transform -rotate-45"></div>
                  </div>
                </div>
                
                {/* Right Speech Bubble - Document */}
                <div className="relative">
                  <div className="w-12 h-8 bg-[#CFB991] rounded-lg relative">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#CFB991]"></div>
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-6 bg-black rounded-sm relative">
                        <div className="absolute top-1 left-1 w-6 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute top-2 left-1 w-4 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute top-3 left-1 w-5 h-0.5 bg-[#CFB991]"></div>
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#CFB991] transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-black mb-4">
            Class Swap for Purdue Students
          </h1>
          <p className="text-xl text-black/80 mb-8">
            Find and swap classes with other Purdue students. Get the schedule that works for you.
          </p>
          
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/swaps">
                <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white shadow-lg">
                  Browse Swaps
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">Browse Courses</CardTitle>
              <CardDescription>
                Search through available courses and sections
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">Connect with Students</CardTitle>
              <CardDescription>
                Find other students looking to swap the same classes
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">Direct Messaging</CardTitle>
              <CardDescription>
                Chat directly with potential swap partners
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
              <CardDescription>
                Get instant notifications about new offers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Hot Swaps</CardTitle>
              <CardDescription>
                Latest swap requests from Purdue students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">CS 180 - Problem Solving</div>
                    <div className="text-sm text-gray-500">John D. • Computer Science • Junior</div>
                  </div>
                  <Badge variant="secondary">2 offers</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">MATH 161 - Calculus I</div>
                    <div className="text-sm text-gray-500">Sarah W. • Mathematics • Freshman</div>
                  </div>
                  <Badge variant="secondary">1 offer</Badge>
                </div>
                <div className="text-center">
                  <Link href="/swaps">
                    <Button variant="outline">View All Swaps</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Search</CardTitle>
              <CardDescription>
                Find courses and see available sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseSearch 
                onCourseSelect={(course) => {
                  // Navigate to swaps page with course filter
                  window.location.href = `/swaps?course=${course.subject}+${course.number}`;
                }}
                showSections={false}
              />
              <div className="text-center mt-4">
                <Link href="/swaps">
                  <Button variant="outline">Browse All Swaps</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Data Notice */}
        {!user && (
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Demo Mode
              </h3>
              <p className="text-blue-700 mb-4">
                This is a demo version. You can browse swaps and offers without signing up, 
                but you&apos;ll need to create an account to create swaps, make offers, or send messages.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/signup">
                  <Button>Create Account</Button>
                </Link>
                <Link href="/swaps">
                  <Button variant="outline">Browse Demo Data</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Show create swap button only when logged in */}
        {user && canCreateSwaps && (
          <div className="mt-12 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Ready to Create a Swap?
              </h3>
              <p className="text-green-700 mb-4">
                You&apos;re logged in and ready to create swap requests or make offers.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/swap/new">
                  <Button>Create Swap Request</Button>
                </Link>
                <Link href="/swaps">
                  <Button variant="outline">Browse Swaps</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}