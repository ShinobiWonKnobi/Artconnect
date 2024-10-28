import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, MessageCircle } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  user?: {
    username: string;
  };
}

interface ArtworkGridProps {
  artworks: Artwork[];
  loading?: boolean;
  onArtworkClick: (artwork: Artwork) => void;
}

export default function ArtworkGrid({ artworks, loading, onArtworkClick }: ArtworkGridProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"
          />
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No artworks found</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {artworks.map((artwork, index) => (
        <motion.button
          key={artwork.id}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onClick={() => onArtworkClick(artwork)}
          className="w-full text-left cursor-pointer group relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
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
        </motion.button>
      ))}
    </div>
  );
}