
/**
 * Core fluid simulation logic
 */
import { 
  getWebGLContext,
  getResolution,
  FluidConfig,
  PointerState,
  DoubleFBO,
  FBO,
} from './webgl-utils';
import {
  createBaseVertexShader,
  createCopyShader,
  createClearShader,
  displayShaderSource,
  createSplatShader,
  createAdvectionShader,
  createDivergenceShader,
  createCurlShader,
  createVorticityShader,
  createPressureShader,
  createGradientSubtractShader
} from './fluid-shaders';
import {
  Material,
  Program,
  createFBO,
  createDoubleFBO,
  resizeDoubleFBO
} from './fluid-classes';

export class FluidEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private ext: any;
  private config: FluidConfig;
  private pointers: PointerState[];
  private dye: DoubleFBO;
  private velocity: DoubleFBO;
  private divergence: FBO;
  private curl: FBO;
  private pressure: DoubleFBO;
  private lastUpdateTime: number = 0;
  private colorUpdateTimer: number = 0;

  // Programs
  private baseVertexShader: WebGLShader;
  private copyProgram: any;
  private clearProgram: any;
  private splatProgram: any;
  private advectionProgram: any;
  private divergenceProgram: any;
  private curlProgram: any;
  private vorticityProgram: any;
  private pressureProgram: any;
  private gradienSubtractProgram: any;
  private displayMaterial: any;
  private blit: (target?: FBO | null, clear?: boolean) => void;

  constructor(canvas: HTMLCanvasElement, config: FluidConfig) {
    this.canvas = canvas;
    this.config = config;
    this.pointers = [];
    
    const { gl, ext } = getWebGLContext(canvas);
    this.gl = gl;
    this.ext = ext;
    
    if (!ext.supportLinearFiltering) {
      this.config.DYE_RESOLUTION = 256;
      this.config.SHADING = false;
    }
    
    // Initialize shaders
    this.baseVertexShader = createBaseVertexShader(gl);
    
    // Initialize programs
    this.copyProgram = new Program(gl, this.baseVertexShader, createCopyShader(gl));
    this.clearProgram = new Program(gl, this.baseVertexShader, createClearShader(gl));
    this.splatProgram = new Program(gl, this.baseVertexShader, createSplatShader(gl));
    this.advectionProgram = new Program(gl, this.baseVertexShader, createAdvectionShader(gl, ext.supportLinearFiltering));
    this.divergenceProgram = new Program(gl, this.baseVertexShader, createDivergenceShader(gl));
    this.curlProgram = new Program(gl, this.baseVertexShader, createCurlShader(gl));
    this.vorticityProgram = new Program(gl, this.baseVertexShader, createVorticityShader(gl));
    this.pressureProgram = new Program(gl, this.baseVertexShader, createPressureShader(gl));
    this.gradienSubtractProgram = new Program(gl, this.baseVertexShader, createGradientSubtractShader(gl));
    this.displayMaterial = new Material(gl, this.baseVertexShader, displayShaderSource);

    // Initialize blit
    this.blit = this.initBlit();

    // Initialize framebuffers
    this.initFramebuffers();
    
    // Set up event listeners
    this.multipleSplats(parseInt((Math.random() * 20).toString()) + 5);
  }

  private initBlit() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer() || null);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer() || null);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target?: FBO | null, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

  private initFramebuffers() {
    const gl = this.gl;
    const ext = this.ext;
    
    let simRes = getResolution(this.config.SIM_RESOLUTION);
    let dyeRes = getResolution(this.config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    
    if (!rgba || !rg || !r) {
      throw new Error("Required texture formats are not supported");
    }
    
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);

    if (!this.dye) {
      this.dye = createDoubleFBO(
        gl,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    } else {
      this.dye = resizeDoubleFBO(
        gl,
        this.dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    }

    if (!this.velocity) {
      this.velocity = createDoubleFBO(
        gl,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    } else {
      this.velocity = resizeDoubleFBO(
        gl,
        this.velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    }

    this.divergence = createFBO(
      gl,
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    
    this.curl = createFBO(
      gl,
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    
    this.pressure = createDoubleFBO(
      gl,
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
  }

  public update() {
    const gl = this.gl;
    const dt = this.calcDeltaTime();
    
    if (!this.config.PAUSED) {
      this.updateColors(dt);
      this.applyInputs();
      if (!this.config.PAUSED) {
        this.step(dt);
      }
    }
    
    this.render();
    this.requestAnimationFrame();
  }

  private requestAnimationFrame() {
    requestAnimationFrame(() => this.update());
  }

  private calcDeltaTime() {
    const now = Date.now();
    let dt = (now - this.lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    this.lastUpdateTime = now;
    return dt;
  }

  private updateColors(dt: number) {
    if (!this.config.COLORFUL) return;

    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    if (this.colorUpdateTimer >= 1) {
      this.colorUpdateTimer = 0;
      this.pointers.forEach(p => {
        p.color = this.generateColor();
      });
    }
  }

  private applyInputs() {
    this.pointers.forEach(p => {
      if (p.moved) {
        p.moved = false;
        if (p.x !== undefined && p.y !== undefined && p.dx !== undefined && p.dy !== undefined) {
          this.splat(p.x, p.y, p.dx, p.dy, p.color);
        }
      }
    });
  }

  private step(dt: number) {
    const gl = this.gl;
    
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);

    // Advection step
    this.advectionProgram.bind();
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.velocity.read.attach(1));
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Curl computation
    this.curlProgram.bind();
    gl.uniform2f(this.curlProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    // Vorticity
    this.vorticityProgram.bind();
    gl.uniform2f(this.vorticityProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.vorticityProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.vorticityProgram.uniforms.curl, this.config.CURL);
    gl.uniform1f(this.vorticityProgram.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Divergence
    this.divergenceProgram.bind();
    gl.uniform2f(this.divergenceProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    // Clear pressure
    this.clearProgram.bind();
    gl.uniform1i(this.clearProgram.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.clearProgram.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write);
    this.pressure.swap();

    // Pressure iteration
    this.pressureProgram.bind();
    gl.uniform2f(this.pressureProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.pressureProgram.uniforms.uDivergence, this.divergence.attach(0));
    
    // Iterative pressure solver
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.pressureProgram.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    // Gradient subtraction
    this.gradienSubtractProgram.bind();
    gl.uniform2f(this.gradienSubtractProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.gradienSubtractProgram.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.gradienSubtractProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    // Advect colors/density
    gl.viewport(0, 0, this.dye.width, this.dye.height);
    
    this.advectionProgram.bind();
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private render() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    if (this.config.TRANSPARENT) {
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
    } else {
      const bc = this.config.BACK_COLOR;
      gl.clearColor(bc.r / 255, bc.g / 255, bc.b / 255, 1.0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    this.displayMaterial.bind();
    if (this.config.SHADING) {
      this.displayMaterial.setKeywords(["SHADING"]);
    } else {
      this.displayMaterial.setKeywords([]);
    }
    
    gl.uniform2f(this.displayMaterial.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.displayMaterial.uniforms.uTexture, this.dye.read.attach(0));
    this.blit();
  }

  public splat(x: number, y: number, dx: number, dy: number, color: number[]) {
    const gl = this.gl;
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    
    this.splatProgram.bind();
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.splatProgram.uniforms.point, x / this.canvas.width, 1.0 - y / this.canvas.height);
    gl.uniform3f(this.splatProgram.uniforms.color, dx, -dy, 1.0);
    gl.uniform1f(this.splatProgram.uniforms.radius, this.config.SPLAT_RADIUS / 100.0);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.viewport(0, 0, this.dye.width, this.dye.height);
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(this.splatProgram.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  public multipleSplats(amount: number) {
    for (let i = 0; i < amount; i++) {
      const color = this.generateColor();
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const dx = 1000 * (Math.random() - 0.5);
      const dy = 1000 * (Math.random() - 0.5);
      this.splat(x, y, dx, dy, color);
    }
  }

  public addPointerInteraction() {
    const canvas = this.canvas;
    let pointer: PointerState = {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      down: false,
      moved: false,
      color: [30, 0, 300]
    };

    canvas.addEventListener('mousemove', (e) => {
      if (!pointer.down) return;
      
      let px = pointer.x;
      let py = pointer.y;
      pointer.x = e.offsetX;
      pointer.y = e.offsetY;
      pointer.dx = (pointer.x - px!) * 8.0;
      pointer.dy = (pointer.y - py!) * 8.0;
      pointer.moved = true;
    });

    canvas.addEventListener('mousedown', (e) => {
      pointer.down = true;
      pointer.color = this.generateColor();
    });

    window.addEventListener('mouseup', () => {
      pointer.down = false;
    });
    
    // Touch events
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      
      let px = pointer.x;
      let py = pointer.y;
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      pointer.dx = (pointer.x - px!) * 8.0;
      pointer.dy = (pointer.y - py!) * 8.0;
      pointer.moved = true;
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      pointer.down = true;
      pointer.color = this.generateColor();
    });

    window.addEventListener('touchend', (e) => {
      pointer.down = false;
    });
    
    this.pointers.push(pointer);
  }

  private generateColor() {
    let c = HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return [c.r, c.g, c.b];
  }

  public resize() {
    const canvas = this.canvas;
    this.initFramebuffers();
  }
}

// Helper function
function HSVtoRGB(h: number, s: number, v: number) {
  let r: number, g: number, b: number;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
    default:
      (r = 0), (g = 0), (b = 0);
  }
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
  };
}
