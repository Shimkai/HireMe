import React, { useState, useEffect } from 'react';
import { Avatar, AvatarProps, Skeleton } from '@mui/material';
import { getImageUrl, preloadImage } from '../../utils/imageUtils';

interface ProfileAvatarProps extends Omit<AvatarProps, 'src'> {
  user: {
    fullName?: string;
    profileAvatar?: string;
  } | null;
  baseUrl?: string;
  fallbackToInitials?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  baseUrl = 'http://localhost:5000',
  fallbackToInitials = true,
  sx,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Construct the full image URL using utility function with cache busting
  const constructImageUrl = (profileAvatar?: string) => {
    const baseImageUrl = getImageUrl(profileAvatar, baseUrl);
    if (!baseImageUrl) return undefined;
    
    // Add cache busting parameter to ensure fresh image loading
    const timestamp = Date.now();
    const separator = baseImageUrl.includes('?') ? '&' : '?';
    return `${baseImageUrl}${separator}t=${timestamp}`;
  };

  // Handle image loading
  useEffect(() => {
    if (!user?.profileAvatar) {
      setImageSrc(undefined);
      setImageError(false);
      return;
    }

    const imageUrl = constructImageUrl(user.profileAvatar);
    if (!imageUrl) {
      setImageSrc(undefined);
      setImageError(false);
      return;
    }

    setImageLoading(true);
    setImageError(false);

    // Use the utility function to preload the image
    preloadImage(imageUrl)
      .then((success) => {
        if (success) {
          setImageSrc(imageUrl);
          setImageError(false);
        } else {
          console.warn(`Failed to load profile image: ${imageUrl}`);
          setImageSrc(undefined);
          setImageError(true);
        }
        setImageLoading(false);
      })
      .catch((error) => {
        console.warn(`Error loading profile image: ${imageUrl}`, error);
        setImageSrc(undefined);
        setImageError(true);
        setImageLoading(false);
      });
  }, [user?.profileAvatar, baseUrl]);

  // Get user initials
  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading skeleton while image is loading
  if (imageLoading) {
    return (
      <Skeleton
        variant="circular"
        width={props.width || 40}
        height={props.height || 40}
        sx={sx}
      />
    );
  }

  return (
    <Avatar
      {...props}
      src={imageSrc}
      sx={{
        ...sx,
        // Add smooth transition when image changes
        transition: 'all 0.3s ease-in-out',
        // Add a subtle border for better visibility
        border: '2px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {!imageSrc && fallbackToInitials && getInitials(user?.fullName)}
    </Avatar>
  );
};

export default ProfileAvatar;
