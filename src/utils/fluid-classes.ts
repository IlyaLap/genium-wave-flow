
/**
 * Classes for WebGL fluid simulation
 */
import { 
  CustomMaterial, 
  CustomProgram, 
  FBO, 
  DoubleFBO,
  hashCode 
} from './webgl-utils';

export class Material implements CustomMaterial {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: Array<WebGLProgram>;
  activeProgram: WebGLProgram | null;
  uniforms: Record<string, WebGLUniformLocation>;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  
  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    vertexShader: WebGLShader, 
    fragmentShaderSource: string
  ) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
    this.programs = [];
    this.activeProgram = null;
    this.uniforms = {};
  }

  setKeywords(keywords: string[]) {
    const gl = this.gl;
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
    
    let program = this.programs[hash];
    if (program == null) {
      let fragmentShader = compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        this.fragmentShaderSource,
        keywords
      );
      program = createProgram(gl, this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }
    
    if (program === this.activeProgram) return;
    this.uniforms = getUniforms(gl, program);
    this.activeProgram = program;
  }

  bind() {
    if (this.activeProgram) {
      this.gl.useProgram(this.activeProgram);
    }
  }
}

export class Program implements CustomProgram {
  uniforms: Record<string, WebGLUniformLocation>;
  program: WebGLProgram;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  
  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    vertexShader: WebGLShader, 
    fragmentShader: WebGLShader
  ) {
    this.gl = gl;
    this.uniforms = {};
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      throw new Error("Failed to create WebGL program");
    }
    this.program = program;
    this.uniforms = getUniforms(gl, this.program);
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexShader: WebGLShader, 
  fragmentShader: WebGLShader
): WebGLProgram {
  let program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create WebGL program");
  }
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error("Failed to link WebGL program");
  }
  return program;
}

function getUniforms(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram
): Record<string, WebGLUniformLocation> {
  let uniforms: Record<string, WebGLUniformLocation> = {};
  let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (uniformInfo) {
      const uniformName = uniformInfo.name;
      const location = gl.getUniformLocation(program, uniformName);
      if (location !== null) {
        uniforms[uniformName] = location;
      }
    }
  }
  return uniforms;
}

export function createFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  w: number, 
  h: number, 
  internalFormat: number, 
  format: number, 
  type: number, 
  param: number
): FBO {
  gl.activeTexture(gl.TEXTURE0);
  let texture = gl.createTexture();
  if (!texture) {
    throw new Error("Failed to create WebGL texture");
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    w,
    h,
    0,
    format,
    type,
    null
  );

  let fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error("Failed to create WebGL framebuffer");
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let texelSizeX = 1.0 / w;
  let texelSizeY = 1.0 / h;
  
  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

export function createDoubleFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  w: number, 
  h: number, 
  internalFormat: number, 
  format: number, 
  type: number, 
  param: number
): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, param);

  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    read: fbo1,
    write: fbo2,
    swap() {
      const temp = this.read;
      this.read = this.write;
      this.write = temp;
    },
  };
}

export function resizeDoubleFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  target: DoubleFBO,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number
): DoubleFBO {
  return createDoubleFBO(gl, w, h, internalFormat, format, type, param);
}

export function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number, 
  source: string, 
  keywords: string[] | null = null
): WebGLShader {
  source = addKeywords(source, keywords);
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create WebGL shader");
  }
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    throw new Error("Failed to compile WebGL shader");
  }
  return shader;
}

function addKeywords(source: string, keywords: string[] | null): string {
  if (!keywords) return source;
  let keywordsString = "";
  keywords.forEach((keyword) => {
    keywordsString += "#define " + keyword + "\n";
  });
  return keywordsString + source;
}
