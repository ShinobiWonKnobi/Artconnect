import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useTags() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('tags');

      if (error) throw error;

      // Flatten and deduplicate tags
      const uniqueTags = Array.from(
        new Set(data.flatMap((artwork) => artwork.tags))
      ).sort();

      return uniqueTags;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  return {
    allTags,
    selectedTags,
    toggleTag,
    clearTags,
  };
}