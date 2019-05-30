export type Matrix = [
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number,
  number, number, number, number, number
];

export type ConvolutionMatrix = [
  number, number, number,
  number, number, number,
  number, number, number
];

function clamp(value: string | number, min: number, max: number): number {
  let parsedValue = typeof value === 'string' ? parseFloat(value) : value;

  if (parsedValue > max) {
    parsedValue = max;
  } else if (parsedValue < min) {
    parsedValue = min;
  }

  return parsedValue;
}

function identity(): Matrix {
  return [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ];
}

const DELTA_INDEX = [
  0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11,
  0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
  0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
  0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68,
  0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
  1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
  1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25,
  2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8,
  4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0,
  7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8,
  10.0
];

function multiply(matrix1: Matrix, matrix2: Matrix): Matrix {
  const col: number[] = [];
  const out: Matrix = new Array(25) as Matrix;
  let val;

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      col[j] = matrix2[j + i * 5];
    }

    for (let j = 0; j < 5; j++) {
      val = 0;

      for (let k = 0; k < 5; k++) {
        val += matrix1[j + k * 5] * col[k];
      }

      out[j + i * 5] = val;
    }
  }

  return out;
}

function adjust(matrix: Matrix, adjustValue: number): Matrix {
  adjustValue = clamp(adjustValue, 0, 1);

  return matrix.map(function (value, index): number {
    if (index % 6 === 0) {
      value = 1.0 - ((1 - value) * adjustValue);
    } else {
      value *= adjustValue;
    }

    return clamp(value, 0, 1);
  }) as Matrix;
}

function adjustContrast(matrix: Matrix, value: number) {
  let x: number;

  value = clamp(value, -1, 1);
  value *= 100;

  if (value < 0) {
    x = 127 + value / 100 * 127;
  } else {
    x = value % 1;

    if (x === 0) {
      x = DELTA_INDEX[value];
    } else {
      // use linear interpolation for more granularity.
      x = DELTA_INDEX[(Math.floor(value))] * (1 - x) + DELTA_INDEX[(Math.floor(value)) + 1] * x;
    }

    x = x * 127 + 127;
  }

  return multiply(matrix, [
    x / 127, 0, 0, 0, 0.5 * (127 - x),
    0, x / 127, 0, 0, 0.5 * (127 - x),
    0, 0, x / 127, 0, 0.5 * (127 - x),
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
}

function adjustSaturation(matrix: Matrix, value: number): Matrix {
  value = clamp(value, -1, 1);
  const x = 1 + ((value > 0) ? 3 * value : value);
  const lumR = 0.3086;
  const lumG = 0.6094;
  const lumB = 0.0820;

  return multiply(matrix, [
    lumR * (1 - x) + x, lumG * (1 - x), lumB * (1 - x), 0, 0,
    lumR * (1 - x), lumG * (1 - x) + x, lumB * (1 - x), 0, 0,
    lumR * (1 - x), lumG * (1 - x), lumB * (1 - x) + x, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
}

function adjustHue(matrix: Matrix, angle: number): Matrix {
  angle = clamp(angle, -180, 180) / 180 * Math.PI;
  const cosVal = Math.cos(angle);
  const sinVal = Math.sin(angle);
  const lumR = 0.213;
  const lumG = 0.715;
  const lumB = 0.072;

  return multiply(matrix, [
    lumR + cosVal * (1 - lumR) + sinVal * (-lumR), lumG + cosVal * (-lumG) + sinVal * (-lumG),
    lumB + cosVal * (-lumB) + sinVal * (1 - lumB), 0, 0,
    lumR + cosVal * (-lumR) + sinVal * (0.143), lumG + cosVal * (1 - lumG) + sinVal * (0.140),
    lumB + cosVal * (-lumB) + sinVal * (-0.283), 0, 0,
    lumR + cosVal * (-lumR) + sinVal * (-(1 - lumR)), lumG + cosVal * (-lumG) + sinVal * (lumG),
    lumB + cosVal * (1 - lumB) + sinVal * (lumB), 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
}

function adjustBrightness(matrix: Matrix, value: number): Matrix {
  value = clamp(255 * value, -255, 255);

  return multiply(matrix, [
    1, 0, 0, 0, value,
    0, 1, 0, 0, value,
    0, 0, 1, 0, value,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
}

function adjustColors(matrix: Matrix, adjustR: number, adjustG: number, adjustB: number): Matrix {
  adjustR = clamp(adjustR, 0, 2);
  adjustG = clamp(adjustG, 0, 2);
  adjustB = clamp(adjustB, 0, 2);

  return multiply(matrix, [
    adjustR, 0, 0, 0, 0,
    0, adjustG, 0, 0, 0,
    0, 0, adjustB, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ]);
}

function adjustSepia(matrix: Matrix, value: number): Matrix {
  value = clamp(value, 0, 1);

  return multiply(matrix, adjust([
    0.393, 0.769, 0.189, 0, 0,
    0.349, 0.686, 0.168, 0, 0,
    0.272, 0.534, 0.131, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ], value));
}

function adjustGrayscale(matrix: Matrix, value: number): Matrix {
  value = clamp(value, 0, 1);

  return multiply(matrix, adjust([
    0.33, 0.34, 0.33, 0, 0,
    0.33, 0.34, 0.33, 0, 0,
    0.33, 0.34, 0.33, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1
  ], value));
}

export {
  identity,
  adjust,
  multiply,
  adjustContrast,
  adjustBrightness,
  adjustSaturation,
  adjustHue,
  adjustColors,
  adjustSepia,
  adjustGrayscale
};