import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useArtworkActions } from '../hooks/useArtwork';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface ArtworkCardProps {
  id: string;
  title: string;
  imageUrl: string;
  artist?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export default function ArtworkCard({
  id,
  title,
  imageUrl,
  artist,
  likesCount,
  commentsCount,
  isLiked = false,
}: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const { toggleLike } = useArtworkActions();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to like artworks');
      return;
    }
    toggleLike.mutate(id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.share({
        title,
        url: `/artwork/${id}`,
      });
    } catch (error) {
      const url = `${window.location.origin}/artwork/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Link to={`/artwork/${id}`}>
      <motion.div
        className="group relative overflow-hidden rounded-lg bg-white shadow-md"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="aspect-w-4 aspect-h-3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            >
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                {artist && (
                  <p className="text-gray-200 text-sm mb-2">by {artist}</p>
                )}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className="flex items-center text-white text-sm hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 mr-1 ${isLiked ? 'fill-pink-400' : ''}`}
                    />
                    {likesCount}
                  </button>
                  <span className="flex items-center text-white text-sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {commentsCount}
                  </span>
                  <button
                    onClick={handleShare}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}