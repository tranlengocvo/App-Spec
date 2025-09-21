'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

// Mock data for demo
const mockSwaps = [
  {
    id: '1',
    current_crn: '12345',
    desired_crns: ['12346', '12347'],
    time_window: 'Morning classes preferred',
    campus: 'West Lafayette',
    term: 'Fall 2024',
    status: 'open',
    notes: 'Looking to switch to a different time slot',
    created_at: '2024-01-15T10:30:00Z',
    courses: {
      subject: 'CS',
      number: '18000',
      title: 'Problem Solving and Object-Oriented Programming'
    },
    users: {
      name: 'John Doe',
      major: 'Computer Science',
      year: 'Junior'
    }
  },
  {
    id: '2',
    current_crn: '12348',
    desired_crns: ['12349'],
    time_window: 'Afternoon classes only',
    campus: 'West Lafayette',
    term: 'Fall 2024',
    status: 'open',
    notes: 'Need to accommodate work schedule',
    created_at: '2024-01-14T14:20:00Z',
    courses: {
      subject: 'CS',
      number: '24000',
      title: 'Programming in C'
    },
    users: {
      name: 'Jane Smith',
      major: 'Computer Science',
      year: 'Senior'
    }
  },
  {
    id: '3',
    current_crn: '12350',
    desired_crns: ['12351', '12352'],
    time_window: 'Any time',
    campus: 'West Lafayette',
    term: 'Fall 2024',
    status: 'open',
    notes: 'Flexible with timing',
    created_at: '2024-01-13T09:15:00Z',
    courses: {
      subject: 'MATH',
      number: '26100',
      title: 'Multivariate Calculus'
    },
    users: {
      name: 'Mike Johnson',
      major: 'Mathematics',
      year: 'Sophomore'
    }
  }
];

export default function SwapsPage() {
  const { user, canCreateSwaps } = useAuth();
  const [swaps] = useState(mockSwaps);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#CFB991]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Class Swaps
            </h1>
            <p className="text-black/80">
              Find and swap classes with other Purdue students
            </p>
          </div>
          {user && canCreateSwaps && (
            <Link href="/swap/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Swap</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-black/10 border border-black/20 rounded-lg">
          <p className="text-black text-sm">
            <strong>Demo Mode:</strong> This is showing mock data. In a real application, this would connect to a database.
              </p>
            </div>

            {/* Swaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swaps.map((swap) => (
            <Card key={swap.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {swap.courses.subject} {swap.courses.number}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {swap.courses.title}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(swap.status)}>
                    {swap.status.toUpperCase()}
                  </Badge>
            </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{swap.users.name}</span>
                    {swap.users.major && (
                      <>
                        <span>•</span>
                        <span>{swap.users.major}</span>
                      </>
                    )}
                    {swap.users.year && (
                      <>
                        <span>•</span>
                        <span>{swap.users.year}</span>
          </>
        )}
                  </div>

                  {/* CRN Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Current:</span>
                      <Badge variant="outline">{swap.current_crn}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Desired:</span>
                      <div className="flex flex-wrap gap-1">
                        {swap.desired_crns.map((crn, index) => (
                          <Badge key={index} variant="outline">{crn}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1 text-sm text-gray-600">
                    {swap.time_window && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{swap.time_window}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{swap.campus} • {swap.term}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(swap.created_at)}
                    </span>
                    <Link href={`/swap/${swap.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}