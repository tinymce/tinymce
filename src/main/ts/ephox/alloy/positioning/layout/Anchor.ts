import * as Origins from './Origins';
import { Struct } from '@ephox/katamari';

/*
 * Smooths over the difference between passing an element anchor (which requires an origin to determine the box) and passing a box.
 *
 * It is only useful for fixed origins; relative needs to do everything the old way.
 */
const anchor = Struct.immutable('anchorBox', 'origin');

const fixedOrigin = function () {
  return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
};

const element = function (anchorElement) {
  const origin = fixedOrigin();
  const anchorBox = Origins.toBox(origin, anchorElement);

  return anchor(anchorBox, origin);
};

const box = function (anchorBox) {
  const origin = fixedOrigin();

  return anchor(anchorBox, origin);
};

export {
  box,
  element
};