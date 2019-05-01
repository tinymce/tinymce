import { HTMLCanvasElement, HTMLImageElement } from '@ephox/dom-globals';

function getWidth(image: HTMLImageElement | HTMLCanvasElement): number {
  return (image as HTMLImageElement).naturalWidth || image.width;
}

function getHeight(image: HTMLImageElement | HTMLCanvasElement): number {
  return (image as HTMLImageElement).naturalHeight || image.height;
}

export {
  getWidth,
  getHeight
};