import { Dialog } from '@headlessui/react';
import { Heart, MessageCircle, Share2, X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useArtwork } from '../hooks/useArtwork';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

interface ArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user: {
      id: string;
      username: string;
      avatar_url: string;
    };
  };
}

export default function ArtworkModal({
  isOpen,
  onClose,
  artwork: initialArtwork,
}: ArtworkModalProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const { artwork, comments, toggleLike, addComment } = useArtwork(initialArtwork.id);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artwork?.title || '',
        url: `/artwork/${artwork?.id}`,
      });
    } catch {
      const url = `${window.location.origin}/artwork/${artwork?.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addComment.mutateAsync(comment);
      setComment('');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  if (!artwork) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative mx-auto flex max-w-6xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Left side - Image */}
          <div className="w-[600px] flex-shrink-0 bg-black">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Right side - Details */}
          <div className="flex w-[400px] flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={artwork.user.avatar_url || 'https://via.placeholder.com/40'}
                  alt={artwork.user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {artwork.user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(artwork.created_at))} ago
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {artwork.title}
                </h2>
                {artwork.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {artwork.description}
                  </p>
                )}
              </div>

              {/* Comments */}
              <div className="px-4 space-y-4">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.user.avatar_url || 'https://via.placeholder.com/32'}
                      alt={comment.user.username}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.user.username}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm break-words">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => user ? toggleLike.mutate() : toast.error('Please sign in to like artworks')}
                    className={`flex items-center space-x-1 transition-colors ${
                      artwork.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${artwork.isLiked ? 'fill-current' : ''}`} />
                    <span>{artwork.likes_count}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {artwork.comments_count} comments
                </span>
              </div>

              {user && (
                <form onSubmit={handleAddComment} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                             dark:text-white dark:placeholder-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={!comment.trim() || addComment.isPending}
                    isLoading={addComment.isPending}
                    size="sm"
                    className="rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}