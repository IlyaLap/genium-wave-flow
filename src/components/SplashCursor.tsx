
"use client";
import { useEffect, useRef, useState } from "react";
import { FluidEngine } from "@/utils/fluid-engine";
import { FluidConfig, UnifiedWebGLContext } from "@/utils/webgl-utils";
import WebGLFallback from "./WebGLFallback";

export function SplashCursor({
  // Add whatever props you like for customization
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1024, // Lower resolution for better performance
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fluidEngineRef = useRef<FluidEngine | null>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to detect WebGL support more reliably
    const detectWebGLSupport = () => {
      try {
        // Try WebGL2 first
        let gl: UnifiedWebGLContext | null = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
        
        if (!gl) {
          // Fall back to WebGL 1 with proper type handling
          gl = (canvas.getContext("webgl") || 
               canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        }
        
        if (!gl) {
          setWebGLSupported(false);
          setErrorMessage("WebGL is not supported in your browser");
          console.error("WebGL is not supported in your browser");
          return false;
        }
        
        // Try creating a simple shader program to verify WebGL works
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertexShader) {
          throw new Error("Failed to create vertex shader");
        }
        
        return true;
      } catch (e) {
        setWebGLSupported(false);
        setErrorMessage(`WebGL initialization error: ${e instanceof Error ? e.message : String(e)}`);
        console.error("WebGL initialization failed:", e);
        return false;
      }
    };

    // Only proceed if WebGL is supported
    if (!detectWebGLSupport()) {
      return;
    }

    try {
      // Configure canvas - use window dimensions
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize configuration
      const config: FluidConfig = {
        SIM_RESOLUTION,
        DYE_RESOLUTION,
        CAPTURE_RESOLUTION,
        DENSITY_DISSIPATION,
        VELOCITY_DISSIPATION,
        PRESSURE,
        PRESSURE_ITERATIONS,
        CURL,
        SPLAT_RADIUS,
        SPLAT_FORCE,
        SHADING,
        COLOR_UPDATE_SPEED,
        BACK_COLOR,
        TRANSPARENT,
        PAUSED: false,
        COLORFUL: true,
      };
      
      // Create FluidEngine with error handling
      let fluidEngine: FluidEngine;
      try {
        fluidEngine = new FluidEngine(canvas, config);
        fluidEngineRef.current = fluidEngine;
      } catch (error) {
        console.error("Failed to initialize FluidEngine:", error);
        setWebGLSupported(false);
        setErrorMessage(`FluidEngine initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      
      // Add pointer interactions
      try {
        fluidEngine.addPointerInteraction();
      } catch (error) {
        console.error("Failed to add pointer interactions:", error);
        // Continue anyway as this is not critical
      }
      
      // Initial splats with error handling
      try {
        fluidEngine.multipleSplats(parseInt((Math.random() * 10 + 5).toString()));
      } catch (error) {
        console.error("Failed to create initial splats:", error);
        // Continue anyway as this is not critical
      }
      
      // Start animation loop with proper animation frame handling
      const animate = () => {
        try {
          if (fluidEngineRef.current) {
            fluidEngineRef.current.update();
          }
          animationFrameRef.current = requestAnimationFrame(animate);
        } catch (error) {
          console.error("Animation error:", error);
          cancelAnimationFrame(animationFrameRef.current!);
        }
      };
      
      // Start the animation
      animationFrameRef.current = requestAnimationFrame(animate);
      setHasInitialized(true);
      
      // Handle window resize
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (fluidEngineRef.current) {
          try {
            fluidEngineRef.current.resize();
          } catch (error) {
            console.error("Failed to resize fluid engine:", error);
          }
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        // Cancel animations on cleanup
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } catch (e) {
      setErrorMessage(`Fluid simulation error: ${e instanceof Error ? e.message : String(e)}`);
      console.error("Fluid simulation failed:", e);
      return;
    }
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
  ]);

  // Provide a visual fallback if WebGL is not supported or initialization failed
  if (!webGLSupported || errorMessage) {
    return (
      <WebGLFallback message={errorMessage || "WebGL not supported - Using gradient fallback"} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-auto z-[-1] ${!hasInitialized ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}`}
      aria-hidden="true"
    />
  );
}
