/**
 * Utility functions for handling image URLs and loading
 */

export const getImageUrl = (imagePath?: string, baseUrl: string = 'http://localhost:5000'): string | undefined => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${normalizedPath}`;
};

export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    return await preloadImage(url);
  } catch {
    return false;
  }
};
