import type { Origin } from './Types';

const isTopLeft = (origin: Origin): origin is 'top-left' => origin === 'top-left';
const isTopRight = (origin: Origin): origin is 'top-right' => origin === 'top-right';
const isBottomLeft = (origin: Origin): origin is 'bottom-left' => origin === 'bottom-left';

const isLeftPositioned = (origin: Origin): origin is 'top-left' | 'bottom-left' =>
  isTopLeft(origin) || isBottomLeft(origin);

const isTopPositioned = (origin: Origin): origin is 'top-left' | 'top-right' =>
  isTopLeft(origin) || isTopRight(origin);

export {
  isTopLeft,
  isTopRight,
  isBottomLeft,
  isLeftPositioned,
  isTopPositioned
};
