/**
 * Contains various tools for rect/position calculation.
 *
 * @class tinymce.geom.Rect
 */

export interface GeomRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface Rect {
  inflate: (rect: GeomRect, w: number, h: number) => GeomRect;
  relativePosition: (rect: GeomRect, targetRect: GeomRect, rel: string) => GeomRect;
  findBestRelativePosition: (rect: GeomRect, targetRect: GeomRect, constrainRect: GeomRect, rels: string[]) => string | null;
  intersect: (rect: GeomRect, cropRect: GeomRect) => GeomRect | null;
  clamp: (rect: GeomRect, clampRect: GeomRect, fixedSize?: boolean) => GeomRect;
  create: (x: number, y: number, w: number, h: number) => GeomRect;
  fromClientRect: (clientRect: DOMRect) => GeomRect;
}

const min = Math.min, max = Math.max, round = Math.round;

/**
 * Returns the rect positioned based on the relative position name
 * to the target rect.
 *
 * @method relativePosition
 * @param {Rect} rect Source rect to modify into a new rect.
 * @param {Rect} targetRect Rect to move relative to based on the rel option.
 * @param {String} rel Relative position. For example: tr-bl.
 */
const relativePosition = (rect: GeomRect, targetRect: GeomRect, rel: string): GeomRect => {
  let x = targetRect.x;
  let y = targetRect.y;
  const w = rect.w;
  const h = rect.h;
  const targetW = targetRect.w;
  const targetH = targetRect.h;

  const relChars = (rel || '').split('');

  if (relChars[0] === 'b') {
    y += targetH;
  }

  if (relChars[1] === 'r') {
    x += targetW;
  }

  if (relChars[0] === 'c') {
    y += round(targetH / 2);
  }

  if (relChars[1] === 'c') {
    x += round(targetW / 2);
  }

  if (relChars[3] === 'b') {
    y -= h;
  }

  if (relChars[4] === 'r') {
    x -= w;
  }

  if (relChars[3] === 'c') {
    y -= round(h / 2);
  }

  if (relChars[4] === 'c') {
    x -= round(w / 2);
  }

  return create(x, y, w, h);
};

/**
 * Tests various positions to get the most suitable one.
 *
 * @method findBestRelativePosition
 * @param {Rect} rect Rect to use as source.
 * @param {Rect} targetRect Rect to move relative to.
 * @param {Rect} constrainRect Rect to constrain within.
 * @param {Array} rels Array of relative positions to test against.
 */
const findBestRelativePosition = (rect: GeomRect, targetRect: GeomRect, constrainRect: GeomRect, rels: string[]): string | null => {
  for (let i = 0; i < rels.length; i++) {
    const pos = relativePosition(rect, targetRect, rels[i]);

    if (pos.x >= constrainRect.x && pos.x + pos.w <= constrainRect.w + constrainRect.x &&
      pos.y >= constrainRect.y && pos.y + pos.h <= constrainRect.h + constrainRect.y) {
      return rels[i];
    }
  }

  return null;
};

/**
 * Inflates the rect in all directions.
 *
 * @method inflate
 * @param {Rect} rect Rect to expand.
 * @param {Number} w Relative width to expand by.
 * @param {Number} h Relative height to expand by.
 * @return {Rect} New expanded rect.
 */
const inflate = (rect: GeomRect, w: number, h: number): GeomRect => {
  return create(rect.x - w, rect.y - h, rect.w + w * 2, rect.h + h * 2);
};

/**
 * Returns the intersection of the specified rectangles.
 *
 * @method intersect
 * @param {Rect} rect The first rectangle to compare.
 * @param {Rect} cropRect The second rectangle to compare.
 * @return {Rect} The intersection of the two rectangles or null if they don't intersect.
 */
const intersect = (rect: GeomRect, cropRect: GeomRect): GeomRect | null => {
  const x1 = max(rect.x, cropRect.x);
  const y1 = max(rect.y, cropRect.y);
  const x2 = min(rect.x + rect.w, cropRect.x + cropRect.w);
  const y2 = min(rect.y + rect.h, cropRect.y + cropRect.h);

  if (x2 - x1 < 0 || y2 - y1 < 0) {
    return null;
  }

  return create(x1, y1, x2 - x1, y2 - y1);
};

/**
 * Returns a rect clamped within the specified clamp rect. This forces the
 * rect to be inside the clamp rect.
 *
 * @method clamp
 * @param {Rect} rect Rectangle to force within clamp rect.
 * @param {Rect} clampRect Rectable to force within.
 * @param {Boolean} fixedSize True/false if size should be fixed.
 * @return {Rect} Clamped rect.
 */
const clamp = (rect: GeomRect, clampRect: GeomRect, fixedSize?: boolean): GeomRect => {
  let x1 = rect.x;
  let y1 = rect.y;
  let x2 = rect.x + rect.w;
  let y2 = rect.y + rect.h;
  const cx2 = clampRect.x + clampRect.w;
  const cy2 = clampRect.y + clampRect.h;

  const underflowX1 = max(0, clampRect.x - x1);
  const underflowY1 = max(0, clampRect.y - y1);
  const overflowX2 = max(0, x2 - cx2);
  const overflowY2 = max(0, y2 - cy2);

  x1 += underflowX1;
  y1 += underflowY1;

  if (fixedSize) {
    x2 += underflowX1;
    y2 += underflowY1;
    x1 -= overflowX2;
    y1 -= overflowY2;
  }

  x2 -= overflowX2;
  y2 -= overflowY2;

  return create(x1, y1, x2 - x1, y2 - y1);
};

/**
 * Creates a new rectangle object.
 *
 * @method create
 * @param {Number} x Rectangle x location.
 * @param {Number} y Rectangle y location.
 * @param {Number} w Rectangle width.
 * @param {Number} h Rectangle height.
 * @return {Rect} New rectangle object.
 */
const create = (x: number, y: number, w: number, h: number): GeomRect => {
  return { x, y, w, h };
};

/**
 * Creates a new rectangle object form a clientRects object.
 *
 * @method fromClientRect
 * @param {ClientRect} clientRect DOM ClientRect object.
 * @return {Rect} New rectangle object.
 */
const fromClientRect = (clientRect: DOMRect): GeomRect => {
  return create(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
};

const Rect: Rect = {
  inflate,
  relativePosition,
  findBestRelativePosition,
  intersect,
  clamp,
  create,
  fromClientRect
};

export default Rect;
