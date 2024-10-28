import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export function useArtwork(artworkId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', artworkId],
    queryFn: async () => {
      const [artworkData, likesData] = await Promise.all([
        supabase
          .from('artworks')
          .select(`
            *,
            user:profiles(id, username, avatar_url)
          `)
          .eq('id', artworkId)
          .single(),
        
        user ? supabase
          .from('likes')
          .select('id')
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id)
          .single() : null
      ]);

      if (artworkData.error) throw artworkData.error;

      return {
        ...artworkData.data,
        isLiked: !!likesData?.data
      };
    },
    enabled: !!artworkId,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['artwork-comments', artworkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match the expected format
      return data?.map(comment => ({
        ...comment,
        user: comment.profiles
      }));
    },
    enabled: !!artworkId,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ artwork_id: artworkId, user_id: user.id });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['artwork', artworkId] });
      const previousArtwork = queryClient.getQueryData(['artwork', artworkId]);

      queryClient.setQueryData(['artwork', artworkId], (old: any) => ({
        ...old,
        likes_count: old.isLiked ? old.likes_count - 1 : old.likes_count + 1,
        isLiked: !old.isLiked,
      }));

      return { previousArtwork };
    },
    onError: (_, __, context: any) => {
      queryClient.setQueryData(['artwork', artworkId], context.previousArtwork);
      toast.error('Failed to update like');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork', artworkId] });
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          artwork_id: artworkId,
          user_id: user.id,
        })
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        user: data.profiles
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork-comments', artworkId] });
      queryClient.invalidateQueries({ queryKey: ['artwork', artworkId] });
      toast.success('Comment added successfully');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  return {
    artwork,
    comments,
    isLoading,
    commentsLoading,
    toggleLike,
    addComment,
  };
}