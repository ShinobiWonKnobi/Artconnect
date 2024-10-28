import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  likes_count: number;
  comments_count: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function ArtworkView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          user:users(id, username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Artwork;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ['artwork-comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:users(username, avatar_url)
        `)
        .eq('artwork_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          artwork_id: id,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork-comments', id] });
      setComment('');
      toast.success('Comment added successfully!');
    },
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('likes')
        .upsert({
          artwork_id: id,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!artwork) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-[500px] object-cover"
        />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={artwork.user.avatar_url || 'https://via.placeholder.com/40'}
                alt={artwork.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold">{artwork.title}</h2>
                <p className="text-gray-600">by {artwork.user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleLike.mutate()}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              >
                <Heart className={`w-6 h-6 ${toggleLike.isLoading ? 'animate-pulse' : ''}`} />
                <span>{artwork.likes_count}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
                className="text-gray-600 hover:text-blue-500"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{artwork.description}</p>

          <div className="flex flex-wrap gap-2">
            {artwork.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        
        {user && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addComment.mutate(comment);
            }}
            className="mb-6"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              type="submit"
              disabled={!comment.trim() || addComment.isPending}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {addComment.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <img
                src={comment.user.avatar_url || 'https://via.placeholder.com/32'}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">{comment.user.username}</p>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}