
/**
 * Asset utilities to ensure proper paths and availability in both development and production
 */

// Get the base path for static assets, accounting for different environments
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // For Netlify deployments, we need to ensure paths are relative
  return normalizedPath;
};

// For image assets specifically
export const getImagePath = (imageName: string): string => {
  return getAssetPath(`lovable-uploads/${imageName}`);
};

// List of main assets for preloading
export const MAIN_ASSETS = {
  logo: 'be65f2cb-3d5e-43e1-bc86-d287f2d35c09.png',
  subsidiaryLogo1: '02cba418-ba71-4ca8-af4e-ab16725a8790.png',
  subsidiaryLogo2: '76e7e9ea-7de1-40ee-9d23-2bb13aff898e.png',
};

// Function to preload critical assets
export const preloadCriticalAssets = (): void => {
  Object.values(MAIN_ASSETS).forEach(asset => {
    const img = new Image();
    img.src = getImagePath(asset);
  });
};
