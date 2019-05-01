import { HTMLCanvasElement, HTMLImageElement } from '@ephox/dom-globals';
import * as Canvas from '../util/Canvas';
import * as ImageSize from '../util/ImageSize';
import { Promise } from '../util/Promise';

/**
 * @method scale
 * @static
 * @param image {Image|Canvas}
 * @param dW {Number} Width that the image should be scaled to
 * @param dH {Number} Height that the image should be scaled to
 * @returns {Promise}
 */
function scale(image: HTMLImageElement | HTMLCanvasElement, dW: number, dH: number): Promise<HTMLCanvasElement> {
  const sW = ImageSize.getWidth(image);
  const sH = ImageSize.getHeight(image);
  let wRatio = dW / sW;
  let hRatio = dH / sH;
  let scaleCapped = false;

  if (wRatio < 0.5 || wRatio > 2) {
    wRatio = wRatio < 0.5 ? 0.5 : 2;
    scaleCapped = true;
  }
  if (hRatio < 0.5 || hRatio > 2) {
    hRatio = hRatio < 0.5 ? 0.5 : 2;
    scaleCapped = true;
  }

  const scaled = _scale(image, wRatio, hRatio);

  return !scaleCapped ? scaled : scaled.then(function (tCanvas) {
    return scale(tCanvas, dW, dH);
  });
}

function _scale(image: HTMLImageElement | HTMLCanvasElement, wRatio: number, hRatio: number): Promise<HTMLCanvasElement> {
  return new Promise(function (resolve) {
    const sW = ImageSize.getWidth(image);
    const sH = ImageSize.getHeight(image);
    const dW = Math.floor(sW * wRatio);
    const dH = Math.floor(sH * hRatio);
    const canvas = Canvas.create(dW, dH);
    const context = Canvas.get2dContext(canvas);

    context.drawImage(image, 0, 0, sW, sH, 0, 0, dW, dH);

    resolve(canvas);
  });
}

export {
  scale
};