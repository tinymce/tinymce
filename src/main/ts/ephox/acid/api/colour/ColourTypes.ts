export interface Hex {
  value: () => string;
}

export interface Hsv {
  hue: () => number;
  saturation: () => number;
  value: () => number;
}

export type Rgba = {
  red: () => number;
  green: () => number;
  blue: () => number;
  alpha: () => number;
}