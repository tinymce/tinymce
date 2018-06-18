import * as Origins from './Origins';
import { Struct } from '@ephox/katamari';
import { OriginAdt } from 'ephox/alloy/behaviour/positioning/PositionApis';
import { SugarElement } from 'ephox/alloy/api/Main';
import { Bounds } from 'ephox/alloy/alien/Boxes';
import { AnchorBox } from 'ephox/alloy/positioning/layout/Layout';
import { window } from '@ephox/dom-globals';

/*
 * Smooths over the difference between passing an element anchor (which requires an origin to determine the box) and passing a box.
 *
 * It is only useful for fixed origins; relative needs to do everything the old way.
 */
export interface Anchor {
  anchorBox: () => Bounds;
  origin: () => OriginAdt;
}

const anchor = Struct.immutable('anchorBox', 'origin');

const fixedOrigin = (): OriginAdt => {
  return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
};

const element = (anchorElement: SugarElement): Anchor => {
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