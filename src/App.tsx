
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Preloader from "./components/Preloader";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import WebGLFallback from "./components/WebGLFallback";
import { useEffect, useState } from "react";

// Check if we should use fallback mode
const shouldUseFallback = () => {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('forceFallback') === 'true') {
    return true;
  }
  
  // Check if WebGL is supported
  try {
    const canvas = document.createElement('canvas');
    return !(canvas.getContext('webgl') || canvas.getContext('webgl2'));
  } catch (e) {
    console.error("WebGL check failed:", e);
    return true;
  }
};

// Create a new query client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [useFallback, setUseFallback] = useState(shouldUseFallback());

  useEffect(() => {
    // Additional check after mount, in case initial check was incorrect
    if (!useFallback) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        
        // If WebGL initialization fails, switch to fallback
        if (!gl) {
          console.warn("WebGL not available after mount check, switching to fallback");
          setUseFallback(true);
        }
      } catch (e) {
        console.error("WebGL check failed after mount:", e);
        setUseFallback(true);
      }
    }

    // Log diagnostic info
    console.log("App mounted with:", {
      useFallback,
      url: window.location.href,
      search: window.location.search
    });
  }, [useFallback]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Use fallback if WebGL is not available */}
        {useFallback && <WebGLFallback />}
        
        {/* Wrap the entire app in our preloader */}
        <Preloader>
          {/* Use BrowserRouter for Netlify deployments */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Preloader>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
