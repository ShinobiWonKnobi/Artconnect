import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string;
}

interface CommentSectionProps {
  artworkId: string;
  comments: Comment[];
}

export default function CommentSection({ artworkId, comments }: CommentSectionProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const addComment = useMutation({
    mutationFn: async (commentContent: string) => {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: commentContent,
          artwork_id: artworkId,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artwork-comments', artworkId] });
      setContent('');
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate(content);
  };

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={!content.trim() || addComment.isPending}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addComment.isPending ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img
              src={comment.avatar_url || 'https://via.placeholder.com/32'}
              alt={comment.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="font-medium text-sm">{comment.username}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}