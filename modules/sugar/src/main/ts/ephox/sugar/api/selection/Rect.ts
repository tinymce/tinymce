/**
 * @deprecated Use RawRect instead
 */
export interface StructRect {
  readonly left: () => number;
  readonly top: () => number;
  readonly right: () => number;
  readonly bottom: () => number;
  readonly width: () => number;
  readonly height: () => number;
}

export interface RawRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
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
