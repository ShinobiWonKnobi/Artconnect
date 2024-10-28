import { useState } from 'react';
import { Camera, Edit } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

interface ProfileHeaderProps {
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  username: string;
  isOwner: boolean;
  onEdit: () => void;
}

export default function ProfileHeader({ 
  avatarUrl, 
  bannerUrl,
  username, 
  isOwner, 
  onEdit 
}: ProfileHeaderProps) {
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const { updateBanner } = useProfile();

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploadingBanner(true);
      await updateBanner.mutateAsync(file);
      toast.success('Banner updated successfully');
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('Failed to update banner');
    } finally {
      setIsUploadingBanner(false);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div 
        className="h-48 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: bannerUrl 
            ? `url(${bannerUrl})` 
            : 'linear-gradient(to right, var(--tw-gradient-stops))',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <div 
          className={`absolute inset-0 ${bannerUrl ? 'bg-black/20' : 'bg-gradient-to-r from-primary-100 to-primary-300 dark:from-primary-300/50 dark:to-primary-200/50'}`}
        />
        
        {isOwner && (
          <div className="absolute right-4 top-4 z-10">
            <label>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={isUploadingBanner}
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                isLoading={isUploadingBanner}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                {isUploadingBanner ? 'Uploading...' : 'Change Banner'}
              </Button>
            </label>
          </div>
        )}
      </div>

      {/* Avatar and Actions */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <img
            src={avatarUrl || 'https://via.placeholder.com/128'}
            alt={username}
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
          />
          {isOwner && (
            <button
              onClick={onEdit}
              className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg 
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}