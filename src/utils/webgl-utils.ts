
/**
 * WebGL utilities for fluid simulation
 */

// Define custom interfaces to fix TypeScript errors
export interface CustomMaterial {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: Array<WebGLProgram>;
  activeProgram: WebGLProgram | null;
  uniforms: Record<string, WebGLUniformLocation>;
  setKeywords: (keywords: string[]) => void;
  bind: () => void;
}

export interface CustomProgram {
  uniforms: Record<string, WebGLUniformLocation>;
  program: WebGLProgram;
  bind: () => void;
}

export interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

export interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

export interface FluidConfig {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  CAPTURE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLOR_UPDATE_SPEED: number;
  BACK_COLOR: { r: number; g: number; b: number };
  TRANSPARENT: boolean;
  PAUSED?: boolean;
}

export interface PointerState {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: number[];
}

export function getWebGLContext(canvas: HTMLCanvasElement): {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: {
    formatRGBA: { internalFormat: number; format: number } | null;
    formatRG: { internalFormat: number; format: number } | null;
    formatR: { internalFormat: number; format: number } | null;
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
  };
} {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };
  
  // Fix: Properly handle the WebGL context types
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
  const isWebGL2 = !!gl;
  
  if (!isWebGL2) {
    gl = (
      canvas.getContext("webgl", params) ||
      canvas.getContext("experimental-webgl", params)
    ) as WebGLRenderingContext | null;
  }
    
  if (!gl) {
    throw new Error("WebGL not supported");
  }
  
  let halfFloat;
  let supportLinearFiltering;
  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
    supportLinearFiltering = (gl as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float");
    supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const halfFloatTexType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : halfFloat?.HALF_FLOAT_OES;
  
  if (!halfFloatTexType) {
    throw new Error("HALF_FLOAT textures not supported");
  }
  
  let formatRGBA;
  let formatRG;
  let formatR;

  try {
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(
        gl,
        (gl as WebGL2RenderingContext).RGBA16F,
        gl.RGBA,
        halfFloatTexType
      );
      formatRG = getSupportedFormat(
        gl, 
        (gl as WebGL2RenderingContext).RG16F, 
        (gl as WebGL2RenderingContext).RG, 
        halfFloatTexType
      );
      formatR = getSupportedFormat(
        gl, 
        (gl as WebGL2RenderingContext).R16F, 
        (gl as WebGL2RenderingContext).RED, 
        halfFloatTexType
      );
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    if (!formatRGBA || !formatRG || !formatR) {
      throw new Error("Required texture formats are not supported");
    }
  } catch (e) {
    console.error("Error setting up texture formats:", e);
    throw new Error(`WebGL texture support error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering: !!supportLinearFiltering,
    },
  };
}

export function getSupportedFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext, 
  internalFormat: number, 
  format: number, 
  type: number
): { internalFormat: number; format: number } | null {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case (gl as WebGL2RenderingContext).R16F:
        return getSupportedFormat(gl, (gl as WebGL2RenderingContext).RG16F, (gl as WebGL2RenderingContext).RG, type);
      case (gl as WebGL2RenderingContext).RG16F:
        return getSupportedFormat(gl, (gl as WebGL2RenderingContext).RGBA16F, gl.RGBA, type);
      default:
        return null;
    }
  }
  return {
    internalFormat,
    format,
  };
}

export function supportRenderTextureFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext, 
  internalFormat: number, 
  format: number, 
  type: number
): boolean {
  const texture = gl.createTexture();
  if (!texture) return false;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    4,
    4,
    0,
    format,
    type,
    null
  );
  const fbo = gl.createFramebuffer();
  if (!fbo) return false;
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

export function hashCode(s: string): number {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function getResolution(resolution: number) {
  let aspectRatio = window.innerWidth / window.innerHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  let min = Math.round(resolution);
  let max = Math.round(resolution * aspectRatio);

  if (window.innerWidth > window.innerHeight) {
    return { width: max, height: min };
  } else {
    return { width: min, height: max };
  }
}

export function createPointerPrototype(): PointerState {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: [0, 0, 0],
  };
}
