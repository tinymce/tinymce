import { Optional } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { Situ, SugarElement, Traverse } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';
import { Carets } from '../keyboard/Carets';
import { Retries } from '../keyboard/Retries';
import { Situs } from '../selection/Situs';
import { BeforeAfter, BeforeAfterFailureConstructor } from './BeforeAfter';

export interface KeyDirection {
  traverse: (element: SugarElement) => Optional<SugarElement>;
  gather: (element: SugarElement, isRoot: (e: SugarElement) => boolean) => Optional<SugarElement>;
  relative: (element: SugarElement) => Situ;
  retry: (bridge: WindowBridge, caret: Carets) => Optional<Situs>;
  failure: BeforeAfterFailureConstructor;
}

const down: KeyDirection = {
  traverse: Traverse.nextSibling,
  gather: DomGather.after,
  relative: Situ.before,
  retry: Retries.tryDown,
  failure: BeforeAfter.failedDown
};

const up: KeyDirection = {
  traverse: Traverse.prevSibling,
  gather: DomGather.before,
  relative: Situ.before,
  retry: Retries.tryUp,
  failure: BeforeAfter.failedUp
};

export {
  down,
  up
};
