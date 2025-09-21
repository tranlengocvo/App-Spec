'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  BookOpen, 
  MapPin, 
  Clock, 
  ArrowLeft
} from 'lucide-react';
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
    notes: 'Looking to switch to a different time slot. I have a conflict with my work schedule and need a morning section.',
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
    notes: 'Need to accommodate work schedule. I work mornings and need afternoon classes.',
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
    notes: 'Flexible with timing. Just looking for a better instructor or time slot.',
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

export default function SwapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Find swap by ID
  const swap = mockSwaps.find(s => s.id === id);

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

  if (!swap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Swap not found
                </h3>
                <p className="text-gray-600 mb-4">
                  The swap request you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Link href="/swaps">
                  <Button>Back to Swaps</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/swaps">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Swaps
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {swap.courses.subject} {swap.courses.number}
                </h1>
                <p className="text-gray-600">{swap.courses.title}</p>
              </div>
            </div>
            <Badge className={getStatusColor(swap.status)}>
              {swap.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Demo Mode:</strong> This is showing mock data. In a real application, this would connect to a database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Swap Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Swap Details</CardTitle>
                <CardDescription>
                  Information about this swap request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current CRN</label>
                    <p className="text-lg font-mono mt-1">{swap.current_crn}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Desired CRNs</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {swap.desired_crns.map((crn, index) => (
                        <Badge key={index} variant="outline">{crn}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {swap.time_window && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Time Window</label>
                    <p className="text-gray-900 mt-1">{swap.time_window}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Campus</label>
                    <p className="text-gray-900 mt-1">{swap.campus}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Term</label>
                    <p className="text-gray-900 mt-1">{swap.term}</p>
                  </div>
                </div>

                {swap.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{swap.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Created {formatTimeAgo(swap.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Offers Section Placeholder */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Offers</CardTitle>
                <CardDescription>
                  Offers from other students will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    Offers section coming soon! This feature will allow other students to make offers on your swap request.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - User Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Requester</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{swap.users.name}</h3>
                  {swap.users.major && (
                    <p className="text-sm text-gray-600">{swap.users.major}</p>
                  )}
                  {swap.users.year && (
                    <p className="text-sm text-gray-600">{swap.users.year}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Course Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Subject:</span>
                    <p className="text-gray-900">{swap.courses.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Number:</span>
                    <p className="text-gray-900">{swap.courses.number}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Title:</span>
                    <p className="text-gray-900">{swap.courses.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}