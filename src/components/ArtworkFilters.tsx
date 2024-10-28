import { useState } from 'react';
import { Filter } from 'lucide-react';
import Button from './ui/Button';
import SearchInput from './SearchInput';

interface ArtworkFiltersProps {
  tags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export default function ArtworkFilters({
  tags,
  selectedTag,
  onTagChange,
  search,
  onSearchChange,
}: ArtworkFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search artworks..."
        />
        <Button
          variant="outline"
          className="sm:w-auto"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm">
          <Button
            variant={selectedTag === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onTagChange(null)}
          >
            All
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onTagChange(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}