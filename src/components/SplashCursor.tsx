
"use client";
import { useEffect, useRef, useState } from "react";
import { FluidEngine } from "@/utils/fluid-engine";
import { FluidConfig } from "@/utils/webgl-utils";

export function SplashCursor({
  // Add whatever props you like for customization
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for WebGL support first
    try {
      const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
      if (!gl) {
        setWebGLSupported(false);
        setErrorMessage("WebGL is not supported in your browser");
        console.error("WebGL is not supported in your browser");
        return;
      }
    } catch (e) {
      setWebGLSupported(false);
      setErrorMessage(`WebGL initialization error: ${e instanceof Error ? e.message : String(e)}`);
      console.error("WebGL initialization failed:", e);
      return;
    }

    try {
      // Configure canvas
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
      
      // Create FluidEngine
      const fluidEngine = new FluidEngine(canvas, config);
      fluidEngineRef.current = fluidEngine;
      
      // Add pointer interactions
      fluidEngine.addPointerInteraction();
      
      // Initial splats
      fluidEngine.multipleSplats(parseInt((Math.random() * 20).toString()) + 5);
      
      // Start animation
      fluidEngine.update();
      
      // Handle window resize
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (fluidEngineRef.current) {
          fluidEngineRef.current.resize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        // Any cleanup if needed
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

  if (!webGLSupported) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white p-4">
        <div>
          <h2 className="text-xl font-bold mb-2">WebGL Not Supported</h2>
          <p>{errorMessage || "Your browser or device does not support WebGL which is required for this effect."}</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-auto z-[-1]"
    />
  );
}
