const create = (width: number, height: number): HTMLCanvasElement => {
  return resize(document.createElement('canvas'), width, height);
};

const clone = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const tCanvas = create(canvas.width, canvas.height);
  const ctx = get2dContext(tCanvas);
  ctx.drawImage(canvas, 0, 0);
  return tCanvas;
};

const get2dContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  return canvas.getContext('2d') as CanvasRenderingContext2D;
};

const get3dContext = (canvas: HTMLCanvasElement): WebGLRenderingContext | null => {
  let gl = null;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
  } catch (e) {
    return null;
  }

  if (!gl) { // it seems that sometimes it doesn't throw exception, but still fails to get context
    gl = null;
  }
  return gl;
};

const resize = (canvas: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement => {
  canvas.width = width;
  canvas.height = height;

  return canvas;
};

export {
  create,
  clone,
  resize,
  get2dContext,
  get3dContext
};
