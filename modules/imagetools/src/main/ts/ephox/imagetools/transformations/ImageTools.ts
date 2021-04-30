import * as Canvas from '../util/Canvas';
import * as ImageResult from '../util/ImageResult';
import * as ImageResizerCanvas from './ImageResizerCanvas';

const ceilWithPrecision = (num: number, precision: number = 2) => {
  const mul = Math.pow(10, precision);
  const upper = Math.round(num * mul);
  return Math.ceil(upper / mul);
};

const rotate = (ir: ImageResult.ImageResult, angle: number): Promise<ImageResult.ImageResult> => {
  return ir.toCanvas().then((canvas) => {
    return applyRotate(canvas, ir.getType(), angle);
  });
};

// Note: Rotating an image multiple times will cause it to appear to shrink if the original image size before transformations isn't retained (see TINY-7372)
const applyRotate = (image: HTMLImageElement | HTMLCanvasElement, type: string, angle: number): Promise<ImageResult.ImageResult> => {
  const degrees = angle < 0 ? 360 + angle : angle;
  const rad = degrees * Math.PI / 180;
  const width = image.width;
  const height = image.height;

  // Determine the new image dimensions after rotating. See https://stackoverflow.com/a/13640990/11275515
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const newWidth = ceilWithPrecision(Math.abs(width * cos) + Math.abs(height * sin));
  const newHeight = ceilWithPrecision(Math.abs(width * sin) + Math.abs(height * cos));

  const canvas = Canvas.create(newWidth, newHeight);
  const context = Canvas.get2dContext(canvas);

  context.translate(newWidth / 2, newHeight / 2);
  context.rotate(rad);
  context.drawImage(image, -width / 2, -height / 2);

  return ImageResult.fromCanvas(canvas, type);
};

const flip = (ir: ImageResult.ImageResult, axis: 'v' | 'h'): Promise<ImageResult.ImageResult> => {
  return ir.toCanvas().then((canvas) => {
    return applyFlip(canvas, ir.getType(), axis);
  });
};

const applyFlip = (image: HTMLImageElement | HTMLCanvasElement, type: string, axis: 'v' | 'h'): Promise<ImageResult.ImageResult> => {
  const canvas = Canvas.create(image.width, image.height);
  const context = Canvas.get2dContext(canvas);

  if (axis === 'v') {
    context.scale(1, -1);
    context.drawImage(image, 0, -canvas.height);
  } else {
    context.scale(-1, 1);
    context.drawImage(image, -canvas.width, 0);
  }

  return ImageResult.fromCanvas(canvas, type);
};

const crop = (ir: ImageResult.ImageResult, x: number, y: number, w: number, h: number): Promise<ImageResult.ImageResult> => {
  return ir.toCanvas().then((canvas) => {
    return applyCrop(canvas, ir.getType(), x, y, w, h);
  });
};

const applyCrop = (image: HTMLImageElement | HTMLCanvasElement, type: string, x: number, y: number, w: number, h: number): Promise<ImageResult.ImageResult> => {
  const canvas = Canvas.create(w, h);
  const context = Canvas.get2dContext(canvas);

  context.drawImage(image, -x, -y);

  return ImageResult.fromCanvas(canvas, type);
};

const resize = (ir: ImageResult.ImageResult, w: number, h: number): Promise<ImageResult.ImageResult> => {
  return ir.toCanvas().then((canvas) => {
    return ImageResizerCanvas.scale(canvas, w, h)
      .then((newCanvas) => {
        return ImageResult.fromCanvas(newCanvas, ir.getType());
      });
  });
};

export {
  rotate,
  flip,
  crop,
  resize
};
