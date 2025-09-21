'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Eye, 
  Edit3, 
  X,
  Mail,
  User
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  mySwaps: Array<{
    id: string;
    course: {
      subject: string;
      number: string;
      title: string;
    };
    current_crn: string;
    desired_crns: string[];
    status: 'open' | 'matched' | 'closed';
    offers_count: number;
    created_at: string;
  }>;
  myOffers: Array<{
    id: string;
    swap: {
      id: string;
      course: {
        subject: string;
        number: string;
        title: string;
      };
      current_crn: string;
      desired_crns: string[];
      status: 'open' | 'matched' | 'closed';
    };
    offered_crn: string;
    status: 'active' | 'withdrawn';
    agree_state: 'NONE' | 'REQ' | 'OFFER' | 'MATCHED';
    created_at: string;
  }>;
  matches: Array<{
    id: string;
    course: {
      subject: string;
      number: string;
      title: string;
    };
    current_crn: string;
    desired_crns: string[];
    status: 'matched';
    created_at: string;
    matched_user: {
      name: string;
      email?: string;
    };
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('swaps');

  // Redirect if not authenticated
  if (!user) {
    router.push('/signin');
    return null;
  }

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', user.id],
    queryFn: async () => {
      // Fetch my swaps
      const { data: mySwaps, error: swapsError } = await supabase
        .from('swap_requests')
        .select(`
          id,
          current_crn,
          desired_crns,
          status,
          created_at,
          courses!inner (
            subject,
            number,
            title
          ),
          offers (
            id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (swapsError) throw swapsError;

      // Fetch my offers
      const { data: myOffers, error: offersError } = await supabase
        .from('offers')
        .select(`
          id,
          offered_crn,
          status,
          agree_state,
          created_at,
          swap_requests!inner (
            id,
            current_crn,
            desired_crns,
            status,
            courses!inner (
              subject,
              number,
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;

      // Fetch matches (swaps that are matched)
      const { data: matches, error: matchesError } = await supabase
        .from('swap_requests')
        .select(`
          id,
          current_crn,
          desired_crns,
          status,
          created_at,
          courses!inner (
            subject,
            number,
            title
          ),
          offers!inner (
            users!inner (
              name,
              email
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'matched')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      return {
        mySwaps: mySwaps?.map(swap => ({
          id: swap.id,
          course: swap.courses,
          current_crn: swap.current_crn,
          desired_crns: swap.desired_crns,
          status: swap.status,
          offers_count: swap.offers?.length || 0,
          created_at: swap.created_at,
        })) || [],
        myOffers: myOffers?.map(offer => ({
          id: offer.id,
          swap: {
            id: offer.swap_requests[0]?.id,
            course: offer.swap_requests[0]?.courses,
            current_crn: offer.swap_requests[0]?.current_crn,
            desired_crns: offer.swap_requests[0]?.desired_crns,
            status: offer.swap_requests[0]?.status,
          },
          offered_crn: offer.offered_crn,
          status: offer.status,
          agree_state: offer.agree_state,
          created_at: offer.created_at,
        })) || [],
        matches: matches?.map(swap => ({
          id: swap.id,
          course: swap.courses,
          current_crn: swap.current_crn,
          desired_crns: swap.desired_crns,
          status: swap.status,
          created_at: swap.created_at,
          matched_user: {
            name: swap.offers[0]?.users?.[0]?.name || 'Unknown',
            email: swap.offers[0]?.users?.[0]?.email,
          },
        })) || [],
      };
    },
  });

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

  const getAgreeStateColor = (state: string) => {
    switch (state) {
      case 'REQ': return 'bg-yellow-100 text-yellow-800';
      case 'OFFER': return 'bg-blue-100 text-blue-800';
      case 'MATCHED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
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
                  Failed to load dashboard
                </h3>
                <p className="text-gray-600">
                  There was an error loading your dashboard data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { mySwaps, myOffers, matches } = dashboardData || { mySwaps: [], myOffers: [], matches: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your swap requests, offers, and matches</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swaps">My Swaps ({mySwaps.length})</TabsTrigger>
            <TabsTrigger value="offers">My Offers ({myOffers.length})</TabsTrigger>
            <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
          </TabsList>

          {/* My Swaps Tab */}
          <TabsContent value="swaps" className="space-y-4">
            {mySwaps.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No swap requests yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first swap request to get started.
                    </p>
                    <Link href="/swap/new">
                      <Button>Create Swap Request</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mySwaps.map((swap) => (
                  <Card key={swap.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {swap.course[0]?.subject} {swap.course[0]?.number}
                            </h3>
                            <Badge className={getStatusColor(swap.status)}>
                              {swap.status.toUpperCase()}
                            </Badge>
                            {swap.offers_count > 0 && (
                              <Badge variant="secondary">
                                {swap.offers_count} offer{swap.offers_count !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{swap.course[0]?.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Current: {swap.current_crn}</span>
                            <span>Desired: {swap.desired_crns.join(', ')}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeAgo(swap.created_at)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/swap/${swap.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {swap.status === 'open' && (
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            {myOffers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No offers yet
                    </h3>
                    <p className="text-gray-600">
                      Browse swap requests to make your first offer.
                    </p>
                    <Link href="/swaps">
                      <Button>Browse Swaps</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myOffers.map((offer) => (
                  <Card key={offer.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {offer.swap.course[0]?.subject} {offer.swap.course[0]?.number}
                            </h3>
                            <Badge className={getStatusColor(offer.swap.status)}>
                              {offer.swap.status.toUpperCase()}
                            </Badge>
                            <Badge className={getAgreeStateColor(offer.agree_state)}>
                              {offer.agree_state}
                            </Badge>
                            {offer.status === 'withdrawn' && (
                              <Badge variant="secondary">Withdrawn</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{offer.swap.course[0]?.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Offered: {offer.offered_crn}</span>
                            <span>For: {offer.swap.current_crn}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeAgo(offer.created_at)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/swap/${offer.swap.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            {matches.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No matches yet
                    </h3>
                    <p className="text-gray-600">
                      When you successfully match with another student, it will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {match.course[0]?.subject} {match.course[0]?.number}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              MATCHED
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{match.course[0]?.title}</p>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>Matched with: {match.matched_user.name}</span>
                            </div>
                            {match.matched_user.email && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{match.matched_user.email}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>Matched {formatTimeAgo(match.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/swap/${match.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
