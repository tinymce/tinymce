import { Optional } from '@ephox/katamari';
import { DomGather, Spot, SpotPoint } from '@ephox/phoenix';
import { SimRange, Situ, SugarElement, Traverse } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';
import { Carets } from '../keyboard/Carets';
import { Retries } from '../keyboard/Retries';
import { Situs } from '../selection/Situs';
import { BeforeAfter, BeforeAfterFailureConstructor } from './BeforeAfter';

export interface KeyDirection {
  traverse: (element: SugarElement) => Optional<SugarElement>;
  gather: (element: SugarElement, isRoot: (e: SugarElement) => boolean) => Optional<SugarElement>;
  relative: (element: SugarElement) => Situ;
  otherRetry: (bridge: WindowBridge, caret: Carets) => Optional<Situs>;
  ieRetry: (bridge: WindowBridge, caret: Carets) => Optional<Situs>;
  failure: BeforeAfterFailureConstructor;
  spot: (sel: SimRange) => SpotPoint<SugarElement>;
}

const down: KeyDirection = {
  traverse: Traverse.nextSibling,
  gather: DomGather.after,
  relative: Situ.before,
  otherRetry: Retries.tryDown,
  ieRetry: Retries.ieTryDown,
  failure: BeforeAfter.failedDown,
  spot: (sel) => Spot.point(sel.finish, sel.foffset)
};

const up: KeyDirection = {
  traverse: Traverse.prevSibling,
  gather: DomGather.before,
  relative: Situ.before,
  otherRetry: Retries.tryUp,
  ieRetry: Retries.ieTryUp,
  failure: BeforeAfter.failedUp,
  spot: (sel) => Spot.point(sel.start, sel.soffset)
};

export {
  down,
  up
};
