import { HTMLCanvasElement, ImageData } from '@ephox/dom-globals';
import * as Canvas from '../util/Canvas';
import { ImageResult, fromCanvas } from '../util/ImageResult';
import * as ColorMatrix from './ColorMatrix';

function colorFilter(ir: ImageResult, matrix: ColorMatrix.Matrix): Promise<ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return applyColorFilter(canvas, ir.getType(), matrix);
  });
}

function applyColorFilter(canvas: HTMLCanvasElement, type: string, matrix: ColorMatrix.Matrix): Promise<ImageResult> {
  const context = Canvas.get2dContext(canvas);

  function applyMatrix(pixelsData: ImageData, m: ColorMatrix.Matrix) {
    // tslint:disable-next-line:one-variable-per-declaration
    let r, g, b, a;
    // tslint:disable-next-line:one-variable-per-declaration
    const data = pixelsData.data,
      m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4],
      m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8], m9 = m[9],
      m10 = m[10], m11 = m[11], m12 = m[12], m13 = m[13], m14 = m[14],
      m15 = m[15], m16 = m[16], m17 = m[17], m18 = m[18], m19 = m[19];

    for (let i = 0; i < data.length; i += 4) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      a = data[i + 3];

      data[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4;
      data[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9;
      data[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14;
      data[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19;
    }

    return pixelsData;
  }

  const pixels = applyMatrix(context.getImageData(0, 0, canvas.width, canvas.height), matrix);
  context.putImageData(pixels, 0, 0);

  return fromCanvas(canvas, type);
}

function convoluteFilter(ir: ImageResult, matrix: ColorMatrix.ConvolutionMatrix): Promise<ImageResult> {
  return ir.toCanvas().then(function (canvas) {
    return applyConvoluteFilter(canvas, ir.getType(), matrix);
  });
}

function applyConvoluteFilter(canvas: HTMLCanvasElement, type: string, matrix: ColorMatrix.ConvolutionMatrix): Promise<ImageResult> {
  const context = Canvas.get2dContext(canvas);

  function applyMatrix(pIn: ImageData, pOut: ImageData, aMatrix: ColorMatrix.ConvolutionMatrix): ImageData {
    function clamp(value: number, min: number, max: number): number {
      if (value > max) {
        value = max;
      } else if (value < min) {
        value = min;
      }

      return value;
    }

    // Calc side and half side of matrix
    const side = Math.round(Math.sqrt(aMatrix.length));
    const halfSide = Math.floor(side / 2);
    const rgba = pIn.data;
    const drgba = pOut.data;
    const w = pIn.width;
    const h = pIn.height;

    // Apply convolution matrix to pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0;
        let g = 0;
        let b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            // Calc relative x, y based on matrix
            const scx = clamp(x + cx - halfSide, 0, w - 1);
            const scy = clamp(y + cy - halfSide, 0, h - 1);

            // Calc r, g, b
            const innerOffset = (scy * w + scx) * 4;
            const wt = aMatrix[cy * side + cx];
            r += rgba[innerOffset] * wt;
            g += rgba[innerOffset + 1] * wt;
            b += rgba[innerOffset + 2] * wt;
          }
        }

        // Set new RGB to destination buffer
        const offset = (y * w + x) * 4;
        drgba[offset] = clamp(r, 0, 255);
        drgba[offset + 1] = clamp(g, 0, 255);
        drgba[offset + 2] = clamp(b, 0, 255);
      }
    }

    return pOut;
  }

  const pixelsIn = context.getImageData(0, 0, canvas.width, canvas.height);
  let pixelsOut = context.getImageData(0, 0, canvas.width, canvas.height);
  pixelsOut = applyMatrix(pixelsIn, pixelsOut, matrix);
  context.putImageData(pixelsOut, 0, 0);

  return fromCanvas(canvas, type);
}

function functionColorFilter(colorFn: (color: number, value: number) => number): (ir: ImageResult, value: number) => Promise<ImageResult> {
  const filterImpl = function (canvas: HTMLCanvasElement, type: string, value: number) {
    const context = Canvas.get2dContext(canvas);
    const lookup = new Array(256);

    function applyLookup(pixelsData: ImageData, lookupData: number[]) {
      const data = pixelsData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = lookupData[data[i]];
        data[i + 1] = lookupData[data[i + 1]];
        data[i + 2] = lookupData[data[i + 2]];
      }

      return pixelsData;
    }

    for (let i = 0; i < lookup.length; i++) {
      lookup[i] = colorFn(i, value);
    }

    const pixels = applyLookup(context.getImageData(0, 0, canvas.width, canvas.height), lookup);
    context.putImageData(pixels, 0, 0);

    return fromCanvas(canvas, type);
  };

  return function (ir: ImageResult, value: number) {
    return ir.toCanvas().then(function (canvas) {
      return filterImpl(canvas, ir.getType(), value);
    });
  };
}

function complexAdjustableColorFilter(matrixAdjustFn: (matrix: ColorMatrix.Matrix, adjust: number) => ColorMatrix.Matrix): (ir: ImageResult, adjust: number) => Promise<ImageResult> {
  return function (ir: ImageResult, adjust: number) {
    return colorFilter(ir, matrixAdjustFn(ColorMatrix.identity(), adjust));
  };
}

function basicColorFilter(matrix: ColorMatrix.Matrix): (ir: ImageResult) => Promise<ImageResult> {
  return function (ir: ImageResult) {
    return colorFilter(ir, matrix);
  };
}

function basicConvolutionFilter(kernel: ColorMatrix.ConvolutionMatrix): (ir: ImageResult) => Promise<ImageResult> {
  return function (ir: ImageResult) {
    return convoluteFilter(ir, kernel);
  };
}

const invert = basicColorFilter([
  -1, 0, 0, 0, 255,
  0, -1, 0, 0, 255,
  0, 0, -1, 0, 255,
  0, 0, 0, 1, 0,
  0, 0, 0, 0, 1
]);

const brightness = complexAdjustableColorFilter(ColorMatrix.adjustBrightness);
const hue = complexAdjustableColorFilter(ColorMatrix.adjustHue);
const saturate = complexAdjustableColorFilter(ColorMatrix.adjustSaturation);
const contrast = complexAdjustableColorFilter(ColorMatrix.adjustContrast);
const grayscale = complexAdjustableColorFilter(ColorMatrix.adjustGrayscale);
const sepia = complexAdjustableColorFilter(ColorMatrix.adjustSepia);
const colorize = function (ir: ImageResult, adjustR: number, adjustG: number, adjustB: number): Promise<ImageResult> {
  return colorFilter(ir, ColorMatrix.adjustColors(ColorMatrix.identity(), adjustR, adjustG, adjustB));
};
const sharpen = basicConvolutionFilter([
  0, -1, 0,
  -1, 5, -1,
  0, -1, 0
]);

const emboss = basicConvolutionFilter([
  -2, -1, 0,
  -1, 1, 1,
  0, 1, 2
]);

const gamma = functionColorFilter(function (color, value) {
  return Math.pow(color / 255, 1 - value) * 255;
});

const exposure = functionColorFilter(function (color, value) {
  return 255 * (1 - Math.exp(-(color / 255) * value));
});

export {
  invert,
  brightness,
  hue,
  saturate,
  contrast,
  grayscale,
  sepia,
  colorize,
  sharpen,
  emboss,
  gamma,
  exposure,
  colorFilter,
  convoluteFilter
};