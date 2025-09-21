'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import OfferItem, { OfferData } from '@/components/OfferItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  BookOpen, 
  MapPin, 
  Clock, 
  Mail, 
  Edit3, 
  X, 
  CheckCircle,
  MessageSquare 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SwapDetailData {
  id: string;
  current_crn: string;
  desired_crns: string[];
  time_window?: string;
  campus?: string;
  term: string;
  status: 'open' | 'matched' | 'closed';
  notes?: string;
  created_at: string;
  course: {
    subject: string;
    number: string;
    title: string;
  };
  user: {
    name: string;
    major?: string;
    year?: string;
    email?: string;
  };
  offers: OfferData[];
}

export default function SwapDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, canCreateSwaps } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch swap details
  const { data: swap, isLoading, error } = useQuery<any>({
    queryKey: ['swap', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          current_crn,
          desired_crns,
          time_window,
          campus,
          term,
          status,
          notes,
          created_at,
          courses!inner (
            subject,
            number,
            title
          ),
          users!inner (
            name,
            major,
            year,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Fetch offers with messages
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select(`
          id,
          offered_crn,
          note,
          status,
          agree_state,
          created_at,
          users!inner (
            name,
            major,
            year
          ),
          messages (
            id,
            body,
            created_at,
            users!inner (
              name
            )
          )
        `)
        .eq('swap_id', id)
        .order('created_at', { ascending: false });

      if (offersError) {
        throw offersError;
      }

      const transformedOffers = offersData?.map(offer => ({
        id: offer.id,
        offered_crn: offer.offered_crn,
        note: offer.note,
        status: offer.status,
        agree_state: offer.agree_state,
        created_at: offer.created_at,
        user: {
          name: offer.users[0]?.name,
          major: offer.users[0]?.major,
          year: offer.users[0]?.year,
        },
        messages: offer.messages?.map(msg => ({
          id: msg.id,
          body: msg.body,
          created_at: msg.created_at,
          sender: {
            name: msg.users[0]?.name,
          },
        })) || [],
      })) || [];

      return {
        ...swap,
        course: swap.courses,
        user: swap.users,
        offers: transformedOffers,
      };
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      const { error } = await supabase
        .from('swap_requests')
        .update({ notes: newNotes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap', id] });
      setIsEditingNotes(false);
      toast.success('Notes updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update notes');
      console.error('Error updating notes:', error);
    },
  });

  // Close swap mutation
  const closeSwapMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap', id] });
      toast.success('Swap request closed');
    },
    onError: (error) => {
      toast.error('Failed to close swap request');
      console.error('Error closing swap:', error);
    },
  });

  // Handle agree/unagree
  const handleAgree = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ 
          agree_state: swap?.user.id === user?.id ? 'REQ' : 'OFFER' 
        })
        .eq('id', offerId);

      if (error) throw error;

      // Check if both sides have agreed
      const { data: offer } = await supabase
        .from('offers')
        .select('agree_state')
        .eq('id', offerId)
        .single();

      if (offer?.agree_state === 'REQ' || offer?.agree_state === 'OFFER') {
        // Check if we can match
        const { data: allOffers } = await supabase
          .from('offers')
          .select('agree_state')
          .eq('swap_id', id);

        const hasReq = allOffers?.some(o => o.agree_state === 'REQ');
        const hasOffer = allOffers?.some(o => o.agree_state === 'OFFER');

        if (hasReq && hasOffer) {
          // Match the offers
          await supabase
            .from('offers')
            .update({ agree_state: 'MATCHED' })
            .eq('swap_id', id)
            .eq('agree_state', 'REQ');

          await supabase
            .from('offers')
            .update({ agree_state: 'MATCHED' })
            .eq('swap_id', id)
            .eq('agree_state', 'OFFER');

          // Update swap status
          await supabase
            .from('swap_requests')
            .update({ status: 'matched' })
            .eq('id', id);

          toast.success('Swap matched! Emails have been revealed.');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['swap', id] });
      toast.success('Agreement updated');
    } catch (error) {
      toast.error('Failed to update agreement');
      console.error('Error updating agreement:', error);
    }
  };

  const handleUnagree = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ agree_state: 'NONE' })
        .eq('id', offerId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['swap', id] });
      toast.success('Agreement removed');
    } catch (error) {
      toast.error('Failed to remove agreement');
      console.error('Error removing agreement:', error);
    }
  };

  const handleWithdraw = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'withdrawn' })
        .eq('id', offerId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['swap', id] });
      toast.success('Offer withdrawn');
    } catch (error) {
      toast.error('Failed to withdraw offer');
      console.error('Error withdrawing offer:', error);
    }
  };

  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['swap', id] });
  };

  const handleUpdateNotes = () => {
    updateNotesMutation.mutate(notes);
  };

  const handleCloseSwap = () => {
    if (confirm('Are you sure you want to close this swap request?')) {
      closeSwapMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !swap) {
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

  const isOwner = user?.id === swap.user.id;
  const isMatched = swap.status === 'matched';
  const showEmails = isMatched && (isOwner || swap.offers.some((o: any) => o.user.name === user?.name));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {swap.course.subject} {swap.course.number}
              </h1>
              <p className="text-gray-600">{swap.course.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={
                swap.status === 'open' ? 'bg-green-100 text-green-800' :
                swap.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }>
                {swap.status.toUpperCase()}
              </Badge>
              {isOwner && swap.status === 'open' && (
                <Button
                  variant="destructive"
                  onClick={handleCloseSwap}
                  disabled={closeSwapMutation.isPending}
                >
                  Close Swap
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Offers */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="offers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="offers">Offers ({swap.offers.length})</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="offers" className="space-y-4">
                {swap.offers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No offers yet
                        </h3>
                        <p className="text-gray-600">
                          Be the first to make an offer on this swap request.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  swap.offers.map((offer: any) => (
                    <OfferItem
                      key={offer.id}
                      offer={offer}
                      isOwner={isOwner}
                      onAgree={handleAgree}
                      onUnagree={handleUnagree}
                      onWithdraw={handleWithdraw}
                      onMessageSent={handleMessageSent}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Swap Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current CRN</label>
                        <p className="text-lg font-mono">{swap.current_crn}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Desired CRNs</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {swap.desired_crns.map((crn: any, index: number) => (
                            <Badge key={index} variant="outline">{crn}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {swap.time_window && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Time Window</label>
                        <p className="text-gray-900">{swap.time_window}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Campus</label>
                        <p className="text-gray-900">{swap.campus}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Term</label>
                        <p className="text-gray-900">{swap.term}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                  <h3 className="font-medium text-gray-900">{swap.user.name}</h3>
                  {swap.user.major && (
                    <p className="text-sm text-gray-600">{swap.user.major}</p>
                  )}
                  {swap.user.year && (
                    <p className="text-sm text-gray-600">{swap.user.year}</p>
                  )}
                </div>
                
                {showEmails && swap.user.email && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{swap.user.email}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  {isOwner && swap.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingNotes(!isEditingNotes);
                        setNotes(swap.notes || '');
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about your swap request..."
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingNotes(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateNotes}
                        disabled={updateNotesMutation.isPending}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    {swap.notes || 'No notes provided.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Match Status */}
            {isMatched && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Matched!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This swap has been successfully matched. Both parties have agreed to the exchange.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
