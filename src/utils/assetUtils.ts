/**
 * Asset utilities to ensure proper paths and availability in both development and production
 */

// Get the base path for static assets, accounting for different environments
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check if we're in a production environment with a custom base path
  const publicUrl = import.meta.env.VITE_PUBLIC_URL || '/';
  
  // Ensure the path has the correct base
  const basePath = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
  
  // For Netlify deployments, we need to ensure paths are relative to the base path
  return `${basePath}${normalizedPath}`;
};

// For image assets specifically - handle both direct and lovable-uploads paths
export const getImagePath = (imageName: string): string => {
  // If it's a full URL already, return as is
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  
  // If it already includes the lovable-uploads path, don't add it again
  if (imageName.includes('lovable-uploads/')) {
    return imageName;
  }
  
  // Otherwise, add the lovable-uploads path
  return `lovable-uploads/${imageName}`;
};

// List of main assets for preloading
export const MAIN_ASSETS = {
  logo: 'be65f2cb-3d5e-43e1-bc86-d287f2d35c09.png',
  subsidiaryLogo1: '02cba418-ba71-4ca8-af4e-ab16725a8790.png',
  subsidiaryLogo2: '76e7e9ea-7de1-40ee-9d23-2bb13aff898e.png',
};

// Check if assets exist and log results
const checkAssetExists = async (asset: string): Promise<boolean> => {
  try {
    const response = await fetch(asset, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    console.error(`Failed to check asset: ${asset}`, e);
    return false;
  }
};

// Function to preload critical assets with better error handling
export const preloadCriticalAssets = async (): Promise<void> => {
  const preloadAsset = async (asset: string) => {
    try {
      const assetPath = getImagePath(asset);
      
      // Check if asset exists first
      const exists = await checkAssetExists(assetPath);
      
      if (exists) {
        const img = new Image();
        img.src = assetPath;
        console.log(`Preloading asset: ${img.src}`);
        return new Promise<void>((resolve) => {
          img.onload = () => {
            console.log(`Successfully loaded: ${img.src}`);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${img.src}`);
            resolve(); // Resolve anyway to not block other assets
          };
        });
      } else {
        console.warn(`Asset not found: ${assetPath}`);
      }
    } catch (e) {
      console.error(`Error preloading asset: ${asset}`, e);
    }
  };

  // Load all assets in parallel
  await Promise.all(Object.values(MAIN_ASSETS).map(preloadAsset));
  console.log('Asset preloading complete');
};

// Diagnostic function to check asset availability
export const runAssetDiagnostics = async (): Promise<{success: boolean, results: Record<string, boolean>}> => {
  const results: Record<string, boolean> = {};
  
  for (const [key, asset] of Object.entries(MAIN_ASSETS)) {
    const assetPath = getImagePath(asset);
    results[key] = await checkAssetExists(assetPath);
  }
  
  const success = Object.values(results).every(result => result);
  
  console.log('Asset diagnostics:', { success, results });
  return { success, results };
};
