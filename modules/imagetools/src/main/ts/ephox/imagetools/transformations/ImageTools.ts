import { HTMLCanvasElement, HTMLImageElement } from '@ephox/dom-globals';
import * as Canvas from '../util/Canvas';
import * as ImageResult from '../util/ImageResult';
import * as ImageResizerCanvas from './ImageResizerCanvas';

function rotate(ir: ImageResult.ImageResult, angle: number): Promise<ImageResult.ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return applyRotate(canvas, ir.getType(), angle);
  });
}
function applyRotate(image: HTMLImageElement | HTMLCanvasElement, type: string, angle: number): Promise<ImageResult.ImageResult> {
  const canvas = Canvas.create(image.width, image.height);
  const context = Canvas.get2dContext(canvas);
  let translateX = 0;
  let translateY = 0;

  angle = angle < 0 ? 360 + angle : angle;

  if (angle === 90 || angle === 270) {
    Canvas.resize(canvas, canvas.height, canvas.width);
  }

  if (angle === 90 || angle === 180) {
    translateX = canvas.width;
  }

  if (angle === 270 || angle === 180) {
    translateY = canvas.height;
  }

  context.translate(translateX, translateY);
  context.rotate(angle * Math.PI / 180);
  context.drawImage(image, 0, 0);

  return ImageResult.fromCanvas(canvas, type);
}

function flip(ir: ImageResult.ImageResult, axis: 'v' | 'h'): Promise<ImageResult.ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return applyFlip(canvas, ir.getType(), axis);
  });
}
function applyFlip(image: HTMLImageElement | HTMLCanvasElement, type: string, axis: 'v' | 'h'): Promise<ImageResult.ImageResult> {
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
}

function crop(ir: ImageResult.ImageResult, x: number, y: number, w: number, h: number): Promise<ImageResult.ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return applyCrop(canvas, ir.getType(), x, y, w, h);
  });
}
function applyCrop(image: HTMLImageElement | HTMLCanvasElement, type: string, x: number, y: number, w: number, h: number): Promise<ImageResult.ImageResult> {
  const canvas = Canvas.create(w, h);
  const context = Canvas.get2dContext(canvas);

  context.drawImage(image, -x, -y);

  return ImageResult.fromCanvas(canvas, type);
}

function resize(ir: ImageResult.ImageResult, w: number, h: number): Promise<ImageResult.ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return ImageResizerCanvas.scale(canvas, w, h)
      .then(function (newCanvas) {
        return ImageResult.fromCanvas(newCanvas, ir.getType());
      });
  });
}

export {
  rotate,
  flip,
  crop,
  resize
};