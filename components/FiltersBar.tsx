'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

export interface FilterState {
  subject: string;
  number: string;
  onlyOpen: boolean;
}

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function FiltersBar({ filters, onFiltersChange, onReset }: FiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = filters.subject || filters.number || filters.onlyOpen;

  const subjects = [
    'CS', 'MATH', 'PHYS', 'CHEM', 'BIOL', 'ENGL', 'HIST', 'ECON', 'PSYC', 'SOCI'
  ];

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary">
              {Object.values(filters).filter(Boolean).length} active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <Select
              value={filters.subject}
              onValueChange={(value) => handleFilterChange('subject', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Number
            </label>
            <Input
              value={filters.number}
              onChange={(e) => handleFilterChange('number', e.target.value)}
              placeholder="e.g., 180"
            />
          </div>

          {/* Only Open Toggle */}
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.onlyOpen}
                onChange={(e) => handleFilterChange('onlyOpen', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Only open swaps
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.subject && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Subject: {filters.subject}</span>
                <button
                  onClick={() => handleFilterChange('subject', '')}
                  className="ml-1 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.number && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Number: {filters.number}</span>
                <button
                  onClick={() => handleFilterChange('number', '')}
                  className="ml-1 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.onlyOpen && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Open only</span>
                <button
                  onClick={() => handleFilterChange('onlyOpen', false)}
                  className="ml-1 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
