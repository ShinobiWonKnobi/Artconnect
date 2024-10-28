import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ArtworkModal from '../components/ArtworkModal';
import { useState } from 'react';

interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
  likes_count: number;
  comments_count: number;
}

export default function Home() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const { data: artworks, isLoading } = useQuery({
    queryKey: ['featured-artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          user:profiles(username, avatar_url),
          likes_count,
          comments_count
        `)
        .order('created_at', { ascending: false })
        .limit(12);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>

        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Discover Amazing Artwork
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore and share beautiful art from creators worldwide
          </p>
        </section>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks?.map((artwork) => (
          <div
            key={artwork.id}
            onClick={() => setSelectedArtwork(artwork)}
            className="cursor-pointer group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
          >
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <h3 className="font-semibold">{artwork.title}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {artwork.likes_count}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {artwork.comments_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

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