export interface StructRect {
  left: () => number;
  top: () => number;
  right: () => number;
  bottom: () => number;
  width: () => number;
  height: () => number;
}

export interface RawRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}