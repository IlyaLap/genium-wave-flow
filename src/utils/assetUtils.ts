/**
 * Asset utilities to ensure proper paths and availability in both development and production
 */

// Get the base path for static assets, accounting for different environments
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // For Netlify deployments, we use the env var or default to '/'
  const publicUrl = import.meta.env.VITE_PUBLIC_URL || '/';
  const isProduction = import.meta.env.PROD === true;
  
  // Check if we have a custom base URL that's not just '/'
  const hasCustomBase = publicUrl !== '/' && publicUrl !== '';
  
  // In production with a custom base, we need to ensure paths are prefixed correctly
  // For development or when base is just '/', we use the path as-is
  const basePath = hasCustomBase && isProduction
    ? (publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`)
    : '/';
    
  console.log(`Asset path resolved: ${basePath}${normalizedPath} (from ${path})`);
  return `${basePath}${normalizedPath}`;
};

// For image assets specifically - handle both direct and lovable-uploads paths
export const getImagePath = (imageName: string): string => {
  // If it's a full URL already, return as is
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  
  // If it already includes the lovable-uploads path, prepare it for getAssetPath
  if (imageName.includes('lovable-uploads/')) {
    return getAssetPath(imageName);
  }
  
  // Otherwise, add the lovable-uploads path and prepare it for getAssetPath
  return getAssetPath(`lovable-uploads/${imageName}`);
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
    console.log(`Checking asset: ${asset}`);
    const response = await fetch(asset, { method: 'HEAD' });
    console.log(`Asset ${asset} status: ${response.status}`);
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
      console.log(`Attempting to preload: ${assetPath}`);
      
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
          img.onerror = (e) => {
            console.warn(`Failed to load image: ${img.src}`, e);
            resolve(); // Resolve anyway to not block other assets
          };
          // Add a timeout to prevent hanging
          setTimeout(() => {
            console.warn(`Timeout loading image: ${img.src}`);
            resolve();
          }, 5000);
        });
      } else {
        console.warn(`Asset not found: ${assetPath}`);
        // Try alternate paths in production
        if (import.meta.env.PROD) {
          const alternateAssetPath = assetPath.startsWith('/') 
            ? assetPath.substring(1) 
            : '/' + assetPath;
          console.log(`Trying alternate path: ${alternateAssetPath}`);
          return preloadAsset(alternateAssetPath);
        }
      }
    } catch (e) {
      console.error(`Error preloading asset: ${asset}`, e);
    }
  };

  // Log environment info for debugging
  console.log("Environment info for asset loading:");
  console.log("- PROD:", import.meta.env.PROD);
  console.log("- MODE:", import.meta.env.MODE);
  console.log("- BASE_URL:", import.meta.env.BASE_URL);
  console.log("- VITE_PUBLIC_URL:", import.meta.env.VITE_PUBLIC_URL);
  
  // Load all assets in parallel
  await Promise.all(Object.values(MAIN_ASSETS).map(preloadAsset));
  console.log('Asset preloading complete');
};

// Diagnostic function to check asset availability
export const runAssetDiagnostics = async (): Promise<{success: boolean, results: Record<string, boolean>}> => {
  const results: Record<string, boolean> = {};
  
  // Log base paths being used
  console.log("Asset diagnostic paths:");
  console.log("- BASE_URL:", import.meta.env.BASE_URL);
  console.log("- Public URL:", import.meta.env.VITE_PUBLIC_URL || '/');
  
  for (const [key, asset] of Object.entries(MAIN_ASSETS)) {
    const assetPath = getImagePath(asset);
    console.log(`Checking ${key}: ${assetPath}`);
    results[key] = await checkAssetExists(assetPath);
    
    // If asset check fails in production, try alternate paths
    if (!results[key] && import.meta.env.PROD) {
      console.log(`Trying alternate paths for: ${key}`);
      
      // Try without leading slash
      if (assetPath.startsWith('/')) {
        const noLeadingSlash = assetPath.substring(1);
        console.log(`Trying without leading slash: ${noLeadingSlash}`);
        results[`${key} (alt1)`] = await checkAssetExists(noLeadingSlash);
      }
      
      // Try with leading slash
      if (!assetPath.startsWith('/')) {
        const withLeadingSlash = '/' + assetPath;
        console.log(`Trying with leading slash: ${withLeadingSlash}`);
        results[`${key} (alt2)`] = await checkAssetExists(withLeadingSlash);
      }
      
      // Try with direct paths in case CDN paths are different
      const directPath = `lovable-uploads/${asset}`;
      console.log(`Trying direct path: ${directPath}`);
      results[`${key} (direct)`] = await checkAssetExists(directPath);
    }
  }
  
  const success = Object.entries(results)
    .filter(([key]) => !key.includes('(alt')) // Only consider primary paths for success
    .every(([_, result]) => result);
  
  console.log('Asset diagnostics:', { success, results });
  return { success, results };
};
