/**
 * @deprecated Use RawRect instead
 */
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

const toRaw = (sr: StructRect): RawRect => ({
  left : sr.left(),
  top: sr.top(),
  right : sr.right(),
  bottom : sr.bottom(),
  width : sr.width(),
  height : sr.height()
});

export const Rect = {
  toRaw
};
