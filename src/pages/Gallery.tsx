import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ArtworkGrid from '../components/ArtworkGrid';
import SearchInput from '../components/SearchInput';
import { useQuery } from '@tanstack/react-query';
import ArtworkModal from '../components/ArtworkModal';

interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const { data: artworks, isLoading } = useQuery({
    queryKey: ['artworks', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          likes_count,
          comments_count,
          user:profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Artwork[];
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['artwork-comments', selectedArtwork?.id],
    queryFn: async () => {
      if (!selectedArtwork) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:profiles(username, avatar_url)
        `)
        .eq('artwork_id', selectedArtwork.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedArtwork,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gallery</h1>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search artworks by title..."
        />
      </div>
      <ArtworkGrid 
        artworks={artworks || []} 
        loading={isLoading} 
        onArtworkClick={setSelectedArtwork}
      />

      {selectedArtwork && (
        <ArtworkModal
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          artwork={selectedArtwork}
          comments={comments || []}
          onLike={() => {
            // Handle like functionality
          }}
          isLiked={false}
        />
      )}
    </div>
  );
}