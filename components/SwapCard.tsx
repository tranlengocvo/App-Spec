'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, User, MessageSquare } from 'lucide-react';

export interface SwapCardData {
  id: string;
  course: {
    subject: string;
    number: string;
    title: string;
  };
  user: {
    name: string;
    major?: string;
    year?: string;
  };
  current_crn: string;
  desired_crns: string[];
  time_window?: string;
  campus?: string;
  term: string;
  status: 'open' | 'matched' | 'closed';
  offers_count: number;
  created_at: string;
}

interface SwapCardProps {
  swap: SwapCardData;
  showActions?: boolean;
}

export default function SwapCard({ swap, showActions = true }: SwapCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {swap.course.subject} {swap.course.number}
            </CardTitle>
            <CardDescription className="mt-1">
              {swap.course.title}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(swap.status)}>
              {swap.status.toUpperCase()}
            </Badge>
            {swap.offers_count > 0 && (
              <Badge variant="secondary">
                {swap.offers_count} offer{swap.offers_count !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{swap.user.name}</span>
            {swap.user.major && (
              <>
                <span>•</span>
                <span>{swap.user.major}</span>
              </>
            )}
            {swap.user.year && (
              <>
                <span>•</span>
                <span>{swap.user.year}</span>
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
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(swap.created_at)}
              </span>
              <div className="flex items-center space-x-2">
                <Link href={`/swap/${swap.id}`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
                {swap.offers_count > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{swap.offers_count}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
