import { HTMLCanvasElement, HTMLImageElement, WebGLProgram, WebGLRenderingContext } from '@ephox/dom-globals';
import { Promise } from '../util/Promise';
import * as Canvas from '../util/Canvas';
import * as ImageSize from '../util/ImageSize';

/**
 * @method scale
 * @static
 * @param image {Image|Canvas}
 * @param dW {Number} Width that the image should be scaled to
 * @param dH {Number} Height that the image should be scaled to
 * @returns {Promise}
 */
function scale(image: HTMLImageElement, dW: number, dH: number): Promise<HTMLCanvasElement> {
  return new Promise(function (resolve, reject) {
    const sW = ImageSize.getWidth(image);
    const sH = ImageSize.getHeight(image);
    const wRatio = dW / sW;
    const hRatio = dH / sH;

    const canvas = Canvas.create(dW, dH);

    try {
      _drawImage(canvas, image, wRatio, hRatio);
    } catch (ex) {
      reject(ex);
      return;
    }

    resolve(canvas);
  });
}

interface Shaders {
  bilinear: {
    VERTEX_SHADER: string;
    FRAGMENT_SHADER: string;
    [key: string]: string;
  };
}

const shaders: Shaders = {
  bilinear: {
    VERTEX_SHADER: '\
            attribute vec2 a_dest_xy;\
            \
            uniform vec2 u_wh;\
            uniform vec2 u_ratio;\
            \
            varying vec2 a_xy;\
            varying vec2 b_xy;\
            varying vec2 c_xy;\
            varying vec2 d_xy;\
            \
            varying float xx0;\
            varying float x1x;\
            varying float yy0;\
            varying float y1y;\
            \
            void main() {\
                vec2 xy = a_dest_xy / u_ratio - 1.0;\
                float x = xy.x;\
                float y = xy.y;\
                float offset = 1.0;\
                \
                float x0 = x - offset;\
                float x1 = x + offset;\
                float y0 = y - offset;\
                float y1 = y + offset;\
                \
                a_xy = vec2(x0, y0) / u_wh;\
                b_xy = vec2(x1, y0) / u_wh;\
                c_xy = vec2(x1, y1) / u_wh;\
                d_xy = vec2(x0, y1) / u_wh;\
                \
                xx0 = (x - x0) / (x1 - x0);\
                x1x = (x1 - x) / (x1 - x0);\
                yy0 = (y - y0) / (y1 - y0);\
                y1y = (y1 - y) / (y1 - y0);\
                \
                gl_Position = vec4(((xy / u_wh) * 2.0 - 1.0) * vec2(1, -1), 0, 1);\
            }\
        ',

    FRAGMENT_SHADER: '\
            precision mediump float;\
            \
            uniform sampler2D u_image;\
            \
            varying vec2 a_xy;\
            varying vec2 b_xy;\
            varying vec2 c_xy;\
            varying vec2 d_xy;\
            \
            varying float xx0;\
            varying float x1x;\
            varying float yy0;\
            varying float y1y;\
            \
            void main() {\
                vec4 a = texture2D(u_image, a_xy);\
                vec4 b = texture2D(u_image, b_xy);\
                vec4 c = texture2D(u_image, c_xy);\
                vec4 d = texture2D(u_image, d_xy);\
                \
                vec4 ab = b * xx0 + a * x1x;\
                vec4 dc = c * xx0 + d * x1x;\
                vec4 abdc = dc * yy0 + ab * y1y;\
                \
                gl_FragColor = abdc;\
            }\
        '
  }
};

function _drawImage(canvas: HTMLCanvasElement, image: HTMLImageElement, wRatio: number, hRatio: number): void {
  const gl = Canvas.get3dContext(canvas);
  if (!gl) {
    throw new Error('Your environment doesn\'t support WebGL.');
  }

  const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (image.width > maxTexSize || image.height > maxTexSize) {
    throw new Error('Width or/and height of the original image exceed max allowed texture size (of ' + maxTexSize + ' px).');
  }

  // we need a gap around the edges to avoid a black frame
  wRatio = canvas.width / (ImageSize.getWidth(image) + 2);
  hRatio = canvas.height / (ImageSize.getHeight(image) + 2);

  const program = _createProgram(gl);
  gl.useProgram(program);

  _loadFloatBuffer(gl, program, 'a_dest_xy', [
    0, 0,
    canvas.width, 0,
    0, canvas.height,
    0, canvas.height,
    canvas.width, 0,
    canvas.width, canvas.height
  ]);

  // load the texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // without this we won't be able to process images of arbitrary dimensions
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  const uResolution = gl.getUniformLocation(program, 'u_wh');
  gl.uniform2f(uResolution, ImageSize.getWidth(image), ImageSize.getHeight(image));

  const uRatio = gl.getUniformLocation(program, 'u_ratio');
  gl.uniform2f(uRatio, wRatio, hRatio);

  // lets draw...
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function _loadFloatBuffer(gl: WebGLRenderingContext, program: WebGLProgram, attrName: string, bufferData: ArrayLike<number> | ArrayBufferLike) {
  const attr = gl.getAttribLocation(program, attrName);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
}

function _createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram() as WebGLProgram;

  for (const type in shaders.bilinear) {
    if (Object.hasOwnProperty.call(shaders.bilinear, type)) {
      gl.attachShader(program, _loadShader(gl, shaders.bilinear[type], type));
    }
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Cannot create a program: ' + err);
  }
  return program;
}

function _loadShader(gl: WebGLRenderingContext, source: string, type: string) {
  const shader = gl.createShader((gl as any)[type]);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Cannot compile a ' + type + ' shader: ' + err);
  }
  return shader;
}

export default {
  scale
};