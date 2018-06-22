import { Struct } from '@ephox/katamari';

import { OriginAdt } from '../../behaviour/positioning/PositionApis';
import { AnchorBox } from '../../positioning/layout/Layout';
import * as Origins from './Origins';
import { window } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

/*
 * Smooths over the difference between passing an element anchor (which requires an origin to determine the box) and passing a box.
 *
 * It is only useful for fixed origins; relative needs to do everything the old way.
 */
export interface Anchor {
  anchorBox: () => AnchorBox;
  origin: () => OriginAdt;
}

const anchor: (anchorBox: AnchorBox, origin: OriginAdt) => Anchor = Struct.immutable('anchorBox', 'origin');

const fixedOrigin = (): OriginAdt => {
  return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
};

const element = (anchorElement: Element): Anchor => {
  const origin = fixedOrigin();
  const anchorBox = Origins.toBox(origin, anchorElement);

  return anchor(anchorBox, origin);
};

const box = (anchorBox: AnchorBox): Anchor => {
  const origin = fixedOrigin();
  return anchor(anchorBox, origin);
};

export {
  box,
  element
};