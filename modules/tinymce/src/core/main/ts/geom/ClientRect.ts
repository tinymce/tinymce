import { Arr, Optional } from '@ephox/katamari';

export interface ClientRect {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

const round = Math.round;

const clone = (rect: ClientRect): ClientRect => {
  if (!rect) {
    return { left: 0, top: 0, bottom: 0, right: 0, width: 0, height: 0 };
  }

  return {
    left: round(rect.left),
    top: round(rect.top),
    bottom: round(rect.bottom),
    right: round(rect.right),
    width: round(rect.width),
    height: round(rect.height)
  };
};

const collapse = (rect: ClientRect, toStart: boolean): ClientRect => {
  rect = clone(rect);

  if (toStart) {
    rect.right = rect.left;
  } else {
    rect.left = rect.left + rect.width;
    rect.right = rect.left;
  }

  rect.width = 0;

  return rect;
};

const isEqual = (rect1: ClientRect, rect2: ClientRect): boolean => (
  rect1.left === rect2.left &&
    rect1.top === rect2.top &&
    rect1.bottom === rect2.bottom &&
    rect1.right === rect2.right
);

const isValidOverflow = (overflowY: number, rect1: ClientRect, rect2: ClientRect): boolean => overflowY >= 0 && overflowY <= Math.min(rect1.height, rect2.height) / 2;

const isAbove = (rect1: ClientRect, rect2: ClientRect): boolean => {
  const halfHeight = Math.min(rect2.height / 2, rect1.height / 2);
  if ((rect1.bottom - halfHeight) < rect2.top) {
    return true;
  }

  if (rect1.top > rect2.bottom) {
    return false;
  }

  return isValidOverflow(rect2.top - rect1.bottom, rect1, rect2);
};

const isBelow = (rect1: ClientRect, rect2: ClientRect): boolean => {
  if (rect1.top > rect2.bottom) {
    return true;
  }

  if (rect1.bottom < rect2.top) {
    return false;
  }

  return isValidOverflow(rect2.bottom - rect1.top, rect1, rect2);
};

const isLeft = (rect1: ClientRect, rect2: ClientRect): boolean => rect1.left < rect2.left;
const isRight = (rect1: ClientRect, rect2: ClientRect): boolean => rect1.right > rect2.right;

const compare = (rect1: ClientRect, rect2: ClientRect): number => {
  if (isAbove(rect1, rect2)) {
    return -1;
  }

  if (isBelow(rect1, rect2)) {
    return 1;
  }

  if (isLeft(rect1, rect2)) {
    return -1;
  }

  if (isRight(rect1, rect2)) {
    return 1;
  }

  return 0;
};

const containsXY = (rect: ClientRect, clientX: number, clientY: number): boolean => (
  clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
);

const boundingClientRectFromRects = (rects: ClientRect[]): Optional<ClientRect> => {
  return Arr.foldl(rects, (acc, rect) => {
    return acc.fold(
      () => Optional.some(rect),
      (prevRect) => {
        const left = Math.min(rect.left, prevRect.left);
        const top = Math.min(rect.top, prevRect.top);
        const right = Math.max(rect.right, prevRect.right);
        const bottom = Math.max(rect.bottom, prevRect.bottom);

        return Optional.some({
          top,
          right,
          bottom,
          left,
          width: right - left,
          height: bottom - top
        });
      }
    );
  }, Optional.none());
};

const distanceToRectEdgeFromXY = <T extends ClientRect>(rect: T, x: number, y: number): number => {
  const cx = Math.max(Math.min(x, rect.left + rect.width), rect.left);
  const cy = Math.max(Math.min(y, rect.top + rect.height), rect.top);
  return Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
};

const overlapX = <T extends ClientRect>(r1: T, r2: T): number => Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
const overlapY = <T extends ClientRect>(r1: T, r2: T): number => Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));

export {
  clone,
  collapse,
  isEqual,
  isAbove,
  isBelow,
  isLeft,
  isRight,
  compare,
  containsXY,
  boundingClientRectFromRects,
  distanceToRectEdgeFromXY,
  overlapX,
  overlapY
};
