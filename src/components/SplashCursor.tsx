import React, { useEffect, useRef } from 'react';

interface HSVColor {
  h: number;
  s: number;
  v: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

const SplashCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Configuration constants
  const BACK_COLOR = { r: 0, g: 0, b: 0 }; // Black background
  const DENSITY_DISSIPATION = 2.5; // Reduced from 3.5 for more persistent effects
  const VELOCITY_DISSIPATION = 1.5; // Reduced for more fluid movement
  const SPLAT_RADIUS = 0.25; // Slightly increased for more visible effects
  const COLOR_UPDATE_SPEED = 5; // Reduced for more subtle color transitions

  function generateColor(): RGBColor {
    // Generate colors in the purple family based on #6F36E5
    // Base hue is around 260 degrees in HSV space
    const baseHue = 260/360; // Convert to 0-1 range
    
    // Randomize slightly around the base hue
    const hue = baseHue + (Math.random() * 0.1 - 0.05); // +/- 5%
    const saturation = 0.7 + (Math.random() * 0.3); // 70-100% saturation
    const value = 0.6 + (Math.random() * 0.4); // 60-100% brightness
    
    let c = HSVtoRGB(hue, saturation, value);
    
    // Adjust intensity for the fluid effect
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    
    return c;
  }

  // HSV to RGB conversion
  function HSVtoRGB(h: number, s: number, v: number): RGBColor {
    let r: number = 0, g: number = 0, b: number = 0;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return { r, g, b };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Use a type assertion to make TypeScript happy with either WebGL context type
    const gl = (canvas.getContext('webgl') || canvas.getContext('webgl2')) as WebGLRenderingContext;
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // WebGL setup
    const createShader = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type) as WebGLShader;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error('Failed to compile shader');
      }
      return shader;
    };

    const createProgram = (vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram => {
      const program = gl.createProgram() as WebGLProgram;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error('Failed to link program');
      }
      
      return program;
    };

    // Vertex shader source
    const vertexShaderSource = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Base fragment shader source
    const baseFragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float uTime;
      void main () {
        vec3 color = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Display fragment shader source
    const displayShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 color = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Curl noise fragment shader source
    const curlShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    // Vorticity fragment shader source
    const vorticityShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(T - B, R - L);
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `;
    
    // Divergence fragment shader source
    const divergenceShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        
        vec2 C = texture2D(uVelocity, vUv).xy;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    // Clear fragment shader source
    const clearShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    // Pressure fragment shader source
    const pressureShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      vec2 boundary (vec2 uv) {
        return uv;
      }
      void main () {
        float L = texture2D(uPressure, boundary(vL)).x;
        float R = texture2D(uPressure, boundary(vR)).x;
        float T = texture2D(uPressure, boundary(vT)).x;
        float B = texture2D(uPressure, boundary(vB)).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    // Gradient subtract fragment shader source
    const gradientSubtractShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    // Advection fragment shader source
    const advectionShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 texelSize;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv) {
        vec2 st = uv / texelSize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * texelSize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * texelSize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * texelSize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * texelSize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * bilerp(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `;
    
    // Splat fragment shader source
    const splatShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    // Compile and link all shaders
    const baseVertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const displayFragmentShader = createShader(gl.FRAGMENT_SHADER, displayShaderSource);
    const baseFragmentShader = createShader(gl.FRAGMENT_SHADER, baseFragmentShaderSource);
    const curlFragmentShader = createShader(gl.FRAGMENT_SHADER, curlShaderSource);
    const vorticityFragmentShader = createShader(gl.FRAGMENT_SHADER, vorticityShaderSource);
    const divergenceFragmentShader = createShader(gl.FRAGMENT_SHADER, divergenceShaderSource);
    const clearFragmentShader = createShader(gl.FRAGMENT_SHADER, clearShaderSource);
    const pressureFragmentShader = createShader(gl.FRAGMENT_SHADER, pressureShaderSource);
    const gradientSubtractFragmentShader = createShader(gl.FRAGMENT_SHADER, gradientSubtractShaderSource);
    const advectionFragmentShader = createShader(gl.FRAGMENT_SHADER, advectionShaderSource);
    const splatFragmentShader = createShader(gl.FRAGMENT_SHADER, splatShaderSource);
    
    const displayProgram = createProgram(baseVertexShader, displayFragmentShader);
    const baseProgram = createProgram(baseVertexShader, baseFragmentShader);
    const curlProgram = createProgram(baseVertexShader, curlFragmentShader);
    const vorticityProgram = createProgram(baseVertexShader, vorticityFragmentShader);
    const divergenceProgram = createProgram(baseVertexShader, divergenceFragmentShader);
    const clearProgram = createProgram(baseVertexShader, clearFragmentShader);
    const pressureProgram = createProgram(baseVertexShader, pressureFragmentShader);
    const gradientSubtractProgram = createProgram(baseVertexShader, gradientSubtractFragmentShader);
    const advectionProgram = createProgram(baseVertexShader, advectionFragmentShader);
    const splatProgram = createProgram(baseVertexShader, splatFragmentShader);

    // Get uniform locations
    const displayUniforms = {
      uTexture: gl.getUniformLocation(displayProgram, 'uTexture')
    };
    
    const baseUniforms = {
      uTexture: gl.getUniformLocation(baseProgram, 'uTexture'),
      uTime: gl.getUniformLocation(baseProgram, 'uTime')
    };
    
    const curlUniforms = {
      uVelocity: gl.getUniformLocation(curlProgram, 'uVelocity')
    };
    
    const vorticityUniforms = {
      uVelocity: gl.getUniformLocation(vorticityProgram, 'uVelocity'),
      uCurl: gl.getUniformLocation(vorticityProgram, 'uCurl'),
      curl: gl.getUniformLocation(vorticityProgram, 'curl'),
      dt: gl.getUniformLocation(vorticityProgram, 'dt')
    };
    
    const divergenceUniforms = {
      uVelocity: gl.getUniformLocation(divergenceProgram, 'uVelocity')
    };
    
    const clearUniforms = {
      uTexture: gl.getUniformLocation(clearProgram, 'uTexture'),
      value: gl.getUniformLocation(clearProgram, 'value')
    };
    
    const pressureUniforms = {
      uPressure: gl.getUniformLocation(pressureProgram, 'uPressure'),
      uDivergence: gl.getUniformLocation(pressureProgram, 'uDivergence')
    };
    
    const gradientSubtractUniforms = {
      uPressure: gl.getUniformLocation(gradientSubtractProgram, 'uPressure'),
      uVelocity: gl.getUniformLocation(gradientSubtractProgram, 'uVelocity')
    };
    
    const advectionUniforms = {
      uVelocity: gl.getUniformLocation(advectionProgram, 'uVelocity'),
      uSource: gl.getUniformLocation(advectionProgram, 'uSource'),
      texelSize: gl.getUniformLocation(advectionProgram, 'texelSize'),
      dt: gl.getUniformLocation(advectionProgram, 'dt'),
      dissipation: gl.getUniformLocation(advectionProgram, 'dissipation')
    };
    
    const splatUniforms = {
      uTarget: gl.getUniformLocation(splatProgram, 'uTarget'),
      aspectRatio: gl.getUniformLocation(splatProgram, 'aspectRatio'),
      point: gl.getUniformLocation(splatProgram, 'point'),
      color: gl.getUniformLocation(splatProgram, 'color'),
      radius: gl.getUniformLocation(splatProgram, 'radius')
    };

    // Create framebuffers
    const framebuffers: WebGLFramebuffer[] = [];
    const createFBO = (width: number, height: number, format: number, type: number): { texture: WebGLTexture, fbo: WebGLFramebuffer } => {
      const texture = gl.createTexture() as WebGLTexture;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null);
      
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;
      framebuffers.push(fbo);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      return { texture, fbo };
    };
    
    // Create uniform setter
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      
      return (destination: WebGLFramebuffer | null) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    // Simulation setup
    let simWidth = 128;
    let simHeight = 128;
    let dyeWidth = 512;
    let dyeHeight = 512;
    
    const texelSizeX = 1.0 / simWidth;
    const texelSizeY = 1.0 / simHeight;
    const texelSize = [texelSizeX, texelSizeY];
    
    // Create simulation FBOs
    const halfFloat = gl.getExtension('OES_texture_half_float')?.HALF_FLOAT_OES || 
                      (gl as any).HALF_FLOAT;
    
    // Make sure the halfFloat type exists
    if (!halfFloat) {
      console.error('HALF_FLOAT not available');
      return;
    }
    
    // Fix: Replace gl.RG with gl.RGBA for compatibility with WebGL1
    let velocity = createDoubleFBO(simWidth, simHeight, gl.RGBA, halfFloat);
    let density = createDoubleFBO(dyeWidth, dyeHeight, gl.RGB, halfFloat);
    let pressure = createDoubleFBO(simWidth, simHeight, gl.RGB, halfFloat);
    let divergence = createFBO(simWidth, simHeight, gl.RGB, halfFloat);
    let curl = createFBO(simWidth, simHeight, gl.RGB, halfFloat);
    
    // Double FBO for ping-pong rendering
    function createDoubleFBO(width: number, height: number, format: number, type: number) {
      let fbo1 = createFBO(width, height, format, type);
      let fbo2 = createFBO(width, height, format, type);
      
      return {
        get read() { return fbo1; },
        get write() { return fbo2; },
        swap() {
          [fbo1, fbo2] = [fbo2, fbo1];
        }
      };
    }

    // Input handling
    const pointers: { [key: string]: { id: number, x: number, y: number, dx: number, dy: number, down: boolean } } = {};
    let lastUpdateTime = Date.now();
    let lastColorChangeTime = 0;
    let currentColor = generateColor();
    let targetColor = generateColor();
    
    function updatePointerDownData(id: number, x: number, y: number) {
      pointers[id] = { id, x, y, dx: 0, dy: 0, down: true };
    }
    
    function updatePointerMoveData(id: number, x: number, y: number) {
      if (!pointers[id]) return;
      pointers[id].dx = x - pointers[id].x;
      pointers[id].dy = y - pointers[id].y;
      pointers[id].x = x;
      pointers[id].y = y;
    }
    
    function updatePointerUpData(id: number) {
      if (pointers[id]) pointers[id].down = false;
    }
    
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        updatePointerDownData(
          -1,
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height
        );
      } else {
        for (let i = 0; i < e.targetTouches.length; i++) {
          const touch = e.targetTouches[i];
          const rect = canvas.getBoundingClientRect();
          updatePointerDownData(
            touch.identifier,
            (touch.clientX - rect.left) / rect.width,
            1.0 - (touch.clientY - rect.top) / rect.height
          );
        }
      }
    };
    
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        updatePointerMoveData(
          -1,
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height
        );
      } else {
        for (let i = 0; i < e.targetTouches.length; i++) {
          const touch = e.targetTouches[i];
          const rect = canvas.getBoundingClientRect();
          updatePointerMoveData(
            touch.identifier,
            (touch.clientX - rect.left) / rect.width,
            1.0 - (touch.clientY - rect.top) / rect.height
          );
        }
      }
    };
    
    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        updatePointerUpData(-1);
      } else {
        for (let i = 0; i < e.changedTouches.length; i++) {
          updatePointerUpData(e.changedTouches[i].identifier);
        }
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    // Blend colors smoothly
    function blendColors(color1: RGBColor, color2: RGBColor, factor: number): RGBColor {
      return {
        r: color1.r + factor * (color2.r - color1.r),
        g: color1.g + factor * (color2.g - color1.g),
        b: color1.b + factor * (color2.b - color1.b)
      };
    }

    // Main rendering loop
    function update() {
      const now = Date.now();
      const dt = Math.min((now - lastUpdateTime) / 1000, 0.016);
      lastUpdateTime = now;
      
      // Update color
      if (now - lastColorChangeTime > 1000) {
        lastColorChangeTime = now;
        targetColor = generateColor();
      }
      
      const colorFactor = Math.min((now - lastColorChangeTime) / 1000, 1) / COLOR_UPDATE_SPEED;
      currentColor = blendColors(currentColor, targetColor, colorFactor);
      
      // Handle active pointers
      for (const id in pointers) {
        const pointer = pointers[id];
        if (!pointer.down) continue;
        
        if (pointer.dx !== 0 || pointer.dy !== 0) {
          splat(pointer.x, pointer.y, pointer.dx, pointer.dy, currentColor);
        }
        
        // Reset delta to prevent continuous splatting at the same position
        pointer.dx = 0;
        pointer.dy = 0;
      }
      
      // Simulation step
      step(dt);
      render(null);
      requestAnimationFrame(update);
    }

    // Simulation logic
    function step(dt: number) {
      gl.disable(gl.BLEND);
      
      // Compute curl
      gl.useProgram(curlProgram);
      gl.uniform1i(curlUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform2fv(gl.getUniformLocation(curlProgram, 'texelSize'), texelSize);
      blit(curl.fbo);
      
      // Apply vorticity
      gl.useProgram(vorticityProgram);
      gl.uniform1i(vorticityUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform1i(vorticityUniforms.uCurl, curl.texture as unknown as number);
      gl.uniform1f(vorticityUniforms.curl, 20);
      gl.uniform1f(vorticityUniforms.dt, dt);
      gl.uniform2fv(gl.getUniformLocation(vorticityProgram, 'texelSize'), texelSize);
      blit(velocity.write.fbo);
      velocity.swap();
      
      // Compute divergence
      gl.useProgram(divergenceProgram);
      gl.uniform1i(divergenceUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform2fv(gl.getUniformLocation(divergenceProgram, 'texelSize'), texelSize);
      blit(divergence.fbo);
      
      // Clear pressure
      gl.useProgram(clearProgram);
      gl.uniform1i(clearUniforms.uTexture, pressure.read.texture as unknown as number);
      gl.uniform1f(clearUniforms.value, 0);
      blit(pressure.write.fbo);
      pressure.swap();
      
      // Pressure solver iterations
      gl.useProgram(pressureProgram);
      gl.uniform1i(pressureUniforms.uDivergence, divergence.texture as unknown as number);
      gl.uniform2fv(gl.getUniformLocation(pressureProgram, 'texelSize'), texelSize);
      
      for (let i = 0; i < 20; i++) {
        gl.uniform1i(pressureUniforms.uPressure, pressure.read.texture as unknown as number);
        blit(pressure.write.fbo);
        pressure.swap();
      }
      
      // Apply pressure gradient
      gl.useProgram(gradientSubtractProgram);
      gl.uniform1i(gradientSubtractUniforms.uPressure, pressure.read.texture as unknown as number);
      gl.uniform1i(gradientSubtractUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform2fv(gl.getUniformLocation(gradientSubtractProgram, 'texelSize'), texelSize);
      blit(velocity.write.fbo);
      velocity.swap();
      
      // Advect velocity
      gl.useProgram(advectionProgram);
      gl.uniform1i(advectionUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform1i(advectionUniforms.uSource, velocity.read.texture as unknown as number);
      gl.uniform1f(advectionUniforms.dt, dt);
      gl.uniform1f(advectionUniforms.dissipation, VELOCITY_DISSIPATION);
      gl.uniform2fv(advectionUniforms.texelSize, texelSize);
      blit(velocity.write.fbo);
      velocity.swap();
      
      // Advect density
      gl.uniform1i(advectionUniforms.uVelocity, velocity.read.texture as unknown as number);
      gl.uniform1i(advectionUniforms.uSource, density.read.texture as unknown as number);
      gl.uniform1f(advectionUniforms.dissipation, DENSITY_DISSIPATION);
      blit(density.write.fbo);
      density.swap();
    }

    // Create splat effect
    function splat(x: number, y: number, dx: number, dy: number, color: RGBColor) {
      gl.useProgram(splatProgram);
      gl.uniform1i(splatUniforms.uTarget, velocity.read.texture as unknown as number);
      gl.uniform1f(splatUniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatUniforms.point, x, y);
      gl.uniform3f(splatUniforms.color, dx * 10, dy * 10, 0);
      gl.uniform1f(splatUniforms.radius, SPLAT_RADIUS);
      blit(velocity.write.fbo);
      velocity.swap();
      
      gl.uniform1i(splatUniforms.uTarget, density.read.texture as unknown as number);
      gl.uniform3f(splatUniforms.color, color.r, color.g, color.b);
      blit(density.write.fbo);
      density.swap();
    }

    // Render to screen
    function render(target: WebGLFramebuffer | null) {
      gl.useProgram(displayProgram);
      gl.uniform1i(displayUniforms.uTexture, density.read.texture as unknown as number);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      blit(target);
    }

    // Create initial splats
    function initSplats() {
      for (let i = 0; i < 3; i++) {
        const x = Math.random();
        const y = Math.random();
        const dx = Math.random() * 2 - 1;
        const dy = Math.random() * 2 - 1;
        const color = generateColor();
        splat(x, y, dx, dy, color);
      }
    }
    
    // Start animation
    initSplats();
    update();

    // Create auto splats at random intervals
    let autosplatInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        const x = Math.random();
        const y = Math.random();
        const dx = Math.random() * 2 - 1;
        const dy = Math.random() * 2 - 1;
        const color = generateColor();
        splat(x, y, dx, dy, color);
      }
    }, 2000);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      clearInterval(autosplatInterval);
      
      // Delete WebGL resources
      framebuffers.forEach((fbo) => gl.deleteFramebuffer(fbo));
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ pointerEvents: 'auto' }}
    />
  );
};

export default SplashCursor;
