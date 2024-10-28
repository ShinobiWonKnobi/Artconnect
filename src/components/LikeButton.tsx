import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface LikeButtonProps {
  artworkId: string;
  initialLikes: number;
  isLiked?: boolean;
}

export default function LikeButton({ artworkId, initialLikes, isLiked = false }: LikeButtonProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(isLiked);
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Must be logged in to like artwork');
      }

      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ artwork_id: artworkId, user_id: user.id });

        if (error) throw error;
      }
    },
    onMutate: () => {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
    },
    onError: () => {
      setLiked(liked);
      setLikes(likes);
      toast.error('Failed to update like');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork', artworkId] });
    },
  });

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to like artworks');
      return;
    }
    toggleLike.mutate();
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleLike.isPending}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Heart
        className={`h-4 w-4 ${liked ? 'fill-current' : ''} ${
          toggleLike.isPending ? 'animate-pulse' : ''
        }`}
      />
      <span>{likes}</span>
    </button>
  );
}