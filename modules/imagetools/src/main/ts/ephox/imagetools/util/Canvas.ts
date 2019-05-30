import { document, HTMLCanvasElement, WebGLRenderingContext, CanvasRenderingContext2D } from '@ephox/dom-globals';

function create(width: number, height: number) {
  return resize(document.createElement('canvas'), width, height);
}

function clone(canvas: HTMLCanvasElement) {
  const tCanvas = create(canvas.width, canvas.height);
  const ctx = get2dContext(tCanvas);
  ctx.drawImage(canvas, 0, 0);
  return tCanvas;
}

function get2dContext(canvas: HTMLCanvasElement) {
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function get3dContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  let gl = null;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {
    return null;
  }

  if (!gl) { // it seems that sometimes it doesn't throw exception, but still fails to get context
    gl = null;
  }
  return gl;
}

function resize(canvas: HTMLCanvasElement, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

export {
  create,
  clone,
  resize,
  get2dContext,
  get3dContext
};