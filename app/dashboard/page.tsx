'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, MapPin, User, Eye, Edit, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for user's swap requests
const mockUserSwaps = [
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
    offers_count: 2
  },
  {
    id: '2',
    current_crn: '12348',
    desired_crns: ['12349'],
    time_window: 'Afternoon classes only',
    campus: 'West Lafayette',
    term: 'Fall 2024',
    status: 'matched',
    notes: 'Need to accommodate work schedule',
    created_at: '2024-01-14T14:20:00Z',
    courses: {
      subject: 'CS',
      number: '24000',
      title: 'Programming in C'
    },
    offers_count: 1
  }
];

// Mock data for user's offers
const mockUserOffers = [
  {
    id: 'offer-1',
    swap_request_id: '3',
    offered_crn: '12351',
    note: 'I can switch to your desired time slot',
    status: 'pending',
    created_at: '2024-01-16T09:15:00Z',
    swap_request: {
      courses: {
        subject: 'MATH',
        number: '26100',
        title: 'Multivariate Calculus'
      },
      users: {
        name: 'Mike Johnson',
        major: 'Mathematics'
      }
    }
  }
];

export default function DashboardPage() {
  const { user, canCreateSwaps, loading } = useAuth();
  const router = useRouter();
  const [userSwaps, setUserSwaps] = useState<any[]>([]);
  const [userOffers, setUserOffers] = useState(mockUserOffers);

  // Load user swaps from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedSwaps = localStorage.getItem(`user_swaps_${user.id}`);
      if (savedSwaps) {
        try {
          const parsedSwaps = JSON.parse(savedSwaps);
          setUserSwaps(parsedSwaps);
        } catch (error) {
          console.error('Error parsing saved swaps:', error);
          // Fallback to mock data if localStorage is corrupted
          setUserSwaps(mockUserSwaps);
        }
      } else {
        // No saved swaps, use mock data for demo
        setUserSwaps(mockUserSwaps);
      }
    }
  }, [user]);

  // Refresh swaps when page becomes visible (user comes back from create swap)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        const savedSwaps = localStorage.getItem(`user_swaps_${user.id}`);
        if (savedSwaps) {
          try {
            const parsedSwaps = JSON.parse(savedSwaps);
            setUserSwaps(parsedSwaps);
          } catch (error) {
            console.error('Error parsing saved swaps:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Save user swaps to localStorage whenever they change
  useEffect(() => {
    if (user && userSwaps.length > 0) {
      localStorage.setItem(`user_swaps_${user.id}`, JSON.stringify(userSwaps));
    }
  }, [userSwaps, user]);

  useEffect(() => {
    if (loading) return;
    
  if (!user) {
    router.push('/signin');
      return;
  }
  }, [user, loading, router]);

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteSwap = (swapId: string) => {
    setUserSwaps(prev => prev.filter(swap => swap.id !== swapId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#CFB991]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-black/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-black/20 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-black/20 rounded"></div>
              <div className="h-32 bg-black/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-[#CFB991]">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              My Dashboard
            </h1>
            <p className="text-black/80">
              Manage your swap requests and offers
            </p>
          </div>
          {canCreateSwaps && (
            <Link href="/swap/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Swap</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">My Swap Requests ({userSwaps.length})</TabsTrigger>
            <TabsTrigger value="offers">My Offers ({userOffers.length})</TabsTrigger>
          </TabsList>

          {/* My Swap Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {userSwaps.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-black mb-2">
                      No swap requests yet
                    </h3>
                    <p className="text-black/80 mb-4">
                      Create your first swap request to get started!
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userSwaps.map((swap) => (
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
                        {/* CRN Info */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-black/80">Current:</span>
                            <Badge variant="outline">{swap.current_crn}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-black/80">Desired:</span>
                            <div className="flex flex-wrap gap-1">
                              {swap.desired_crns.map((crn: string, index: number) => (
                                <Badge key={index} variant="outline">{crn}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-1 text-sm text-black/70">
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

                        {/* Offers Count */}
                        <div className="flex items-center space-x-2 text-sm text-black/70">
                          <MessageSquare className="h-4 w-4" />
                          <span>{swap.offers_count} offer{swap.offers_count !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-xs text-black/60">
                            {formatTimeAgo(swap.created_at)}
                          </span>
                        <div className="flex items-center space-x-2">
                          <Link href={`/swap/${swap.id}`}>
                              <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {swap.status === 'open' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteSwap(swap.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
              <Card>
              <CardHeader>
                <CardTitle>My Offers</CardTitle>
                <CardDescription>
                  Offers you&apos;ve made to other students&apos; swap requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-black mb-2">
                    Offers feature coming soon
                    </h3>
                  <p className="text-black/80 mb-4">
                    This feature is under development. You&apos;ll be able to make offers to other students&apos; swap requests and track their status.
                  </p>
                  <div className="text-sm text-black/70">
                    Expected features:
                    <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                      <li>• Make offers to swap requests</li>
                      <li>• Track offer status (pending, accepted, rejected)</li>
                      <li>• Chat with swap partners</li>
                      <li>• Confirm successful swaps</li>
                    </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}