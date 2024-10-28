import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ProfileHeader from '../components/ProfileHeader';
import ProfileEdit from '../components/ProfileEdit';
import SocialLinks from '../components/SocialLinks';
import ArtworkGrid from '../components/ArtworkGrid';
import ArtworkModal from '../components/ArtworkModal';

interface Profile {
  username: string;
  bio: string;
  avatar_url: string;
  social_links?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface Artwork {
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
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery({
    queryKey: ['user-artworks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          likes_count,
          comments_count,
          user:profiles(id, username, avatar_url)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Artwork[];
    },
  });

  const renderMarkdown = (text: string) => {
    const html = marked(text);
    return DOMPurify.sanitize(html);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <ProfileHeader
        avatarUrl={profile?.avatar_url}
        username={profile?.username || ''}
        isOwner={true}
        onEdit={() => setIsEditing(true)}
      />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {isEditing && profile ? (
          <ProfileEdit
            userId={user!.id}
            initialData={profile}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {profile?.username}
            </motion.h1>

            {profile?.social_links && <SocialLinks links={profile.social_links} />}

            {profile?.bio && (
              <div
                className="prose dark:prose-invert max-w-none mt-8 px-4"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(profile.bio) }}
              />
            )}
          </div>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Artworks
          </h2>
          <ArtworkGrid
            artworks={artworks || []}
            loading={artworksLoading}
            onArtworkClick={setSelectedArtwork}
          />
        </section>

        {selectedArtwork && (
          <ArtworkModal
            isOpen={!!selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
            artwork={selectedArtwork}
          />
        )}
      </main>
    </div>
  );
}