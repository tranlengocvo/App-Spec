'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCourses, parseCourseInput, CourseWithSections } from '@/lib/purdue-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Clock, User, MapPin } from 'lucide-react';

interface CourseSearchProps {
  onCourseSelect?: (course: CourseWithSections) => void;
  showSections?: boolean;
}

export default function CourseSearch({ onCourseSelect, showSections = true }: CourseSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState<{ subject: string; number: string } | null>(null);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', searchQuery],
    queryFn: () => searchQuery ? searchCourses(searchQuery.subject, searchQuery.number) : null,
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseCourseInput(searchInput);
    if (parsed) {
      setSearchQuery(parsed);
    }
  };

  const handleCourseClick = () => {
    if (course && onCourseSelect) {
      onCourseSelect(course);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="e.g., CS 180"
          className="flex-1 bg-white border-black"
        />
        <Button type="submit" disabled={!searchInput.trim()}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Failed to load course data. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {course && (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCourseClick}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {course.subject} {course.number}
                </CardTitle>
                <CardDescription className="mt-1">
                  {course.title}
                </CardDescription>
              </div>
              {onCourseSelect && (
                <Button variant="outline" size="sm">
                  View Swaps
                </Button>
              )}
            </div>
          </CardHeader>
          
          {showSections && course.sections.length > 0 && (
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Available Sections:</h4>
                <div className="grid gap-2">
                  {course.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{section.crn}</Badge>
                        <span className="text-sm font-medium">{section.section_code}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {section.meeting_days && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{section.meeting_days} {section.meeting_time}</span>
                          </div>
                        )}
                        {section.instructor && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{section.instructor}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{section.term}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {searchQuery && !course && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No course found for {searchQuery.subject} {searchQuery.number}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
