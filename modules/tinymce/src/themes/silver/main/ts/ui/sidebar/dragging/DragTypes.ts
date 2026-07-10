export interface AllowedOverflow {
  horizontal: number;
  vertical: number;
}

export type Origin = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Shift {
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface CssPosition {
  x: string;
  y: string;
}

export interface CssSize {
  width: string;
  height: string;
}

export interface Boundaries {
  x: { min: number; max: number };
  y: { min: number; max: number };
}

export interface Size {
  width: number;
  height: number;
}
