'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMessageSchema, CreateMessageFormData } from '@/lib/validations';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { MessageSquare, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface OfferData {
  id: string;
  offered_crn: string;
  note?: string;
  status: 'active' | 'withdrawn';
  agree_state: 'NONE' | 'REQ' | 'OFFER' | 'MATCHED';
  created_at: string;
  user: {
    name: string;
    major?: string;
    year?: string;
  };
  messages: Array<{
    id: string;
    body: string;
    created_at: string;
    sender: {
      name: string;
    };
  }>;
}

interface OfferItemProps {
  offer: OfferData;
  isOwner: boolean;
  onAgree: (offerId: string) => void;
  onUnagree: (offerId: string) => void;
  onWithdraw: (offerId: string) => void;
  onMessageSent: () => void;
}

export default function OfferItem({
  offer,
  isOwner,
  onAgree,
  onUnagree,
  onWithdraw,
  onMessageSent,
}: OfferItemProps) {
  const { user } = useAuth();
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMessageFormData>({
    resolver: zodResolver(createMessageSchema),
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

  const getAgreeStateColor = (state: string) => {
    switch (state) {
      case 'REQ': return 'bg-yellow-100 text-yellow-800';
      case 'OFFER': return 'bg-blue-100 text-blue-800';
      case 'MATCHED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgreeStateText = (state: string) => {
    switch (state) {
      case 'REQ': return 'Agreement Requested';
      case 'OFFER': return 'Agreement Offered';
      case 'MATCHED': return 'Matched!';
      default: return 'No Agreement';
    }
  };

  const canAgree = () => {
    if (!user) return false;
    if (offer.agree_state === 'MATCHED') return false;
    if (isOwner) {
      // Owner can agree to their own offer
      return offer.agree_state === 'NONE' || offer.agree_state === 'REQ';
    } else {
      // Other user can agree to the offer
      return offer.agree_state === 'NONE' || offer.agree_state === 'OFFER';
    }
  };

  const canUnagree = () => {
    if (!user) return false;
    if (offer.agree_state === 'MATCHED') return false;
    return offer.agree_state === 'REQ' || offer.agree_state === 'OFFER';
  };

  const handleAgree = () => {
    onAgree(offer.id);
  };

  const handleUnagree = () => {
    onUnagree(offer.id);
  };

  const handleWithdraw = () => {
    onWithdraw(offer.id);
  };

  const onSubmitMessage = async (data: CreateMessageFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          offer_id: offer.id,
          sender_id: user.id,
          body: data.body,
        });

      if (error) {
        throw error;
      }

      reset();
      onMessageSent();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              CRN {offer.offered_crn}
            </CardTitle>
            <CardDescription className="mt-1">
              Offered by {offer.user.name}
              {offer.user.major && ` • ${offer.user.major}`}
              {offer.user.year && ` • ${offer.user.year}`}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getAgreeStateColor(offer.agree_state)}>
              {getAgreeStateText(offer.agree_state)}
            </Badge>
            {offer.status === 'withdrawn' && (
              <Badge variant="secondary">Withdrawn</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Note */}
          {offer.note && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{offer.note}</p>
            </div>
          )}

          {/* Messages Preview */}
          {offer.messages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recent Messages:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {offer.messages.slice(-3).map((message) => (
                  <div key={message.id} className="text-xs text-gray-600">
                    <span className="font-medium">{message.sender.name}:</span>{' '}
                    {message.body}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(offer.created_at)}</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* DM Button */}
              <Dialog open={isDmOpen} onOpenChange={setIsDmOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    DM
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Direct Message</DialogTitle>
                    <DialogDescription>
                      Chat with {offer.user.name} about this offer
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {offer.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-2 rounded-lg text-sm ${
                            message.sender.name === user?.name
                              ? 'bg-blue-100 ml-8'
                              : 'bg-gray-100 mr-8'
                          }`}
                        >
                          <div className="font-medium text-xs text-gray-600 mb-1">
                            {message.sender.name}
                          </div>
                          <div>{message.body}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(message.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Form */}
                    <form onSubmit={handleSubmit(onSubmitMessage)} className="space-y-2">
                      <Textarea
                        {...register('body')}
                        placeholder="Type your message..."
                        rows={3}
                        className="resize-none"
                      />
                      {errors.body && (
                        <p className="text-sm text-red-600">{errors.body.message}</p>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDmOpen(false)}
                        >
                          Close
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Sending...' : 'Send'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Agree/Unagree Buttons */}
              {canAgree() && (
                <Button
                  size="sm"
                  onClick={handleAgree}
                  className="flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Agree</span>
                </Button>
              )}

              {canUnagree() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnagree}
                  className="flex items-center space-x-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Unagree</span>
                </Button>
              )}

              {/* Withdraw Button (for offer owner) */}
              {isOwner && offer.status === 'active' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleWithdraw}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
