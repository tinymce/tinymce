import type { Optional } from '@ephox/katamari';
import { DomGather } from '@ephox/phoenix';
import { Situ, type SugarElement, Traverse } from '@ephox/sugar';

import type { WindowBridge } from '../api/WindowBridge';
import type { Carets } from '../keyboard/Carets';
import { Retries } from '../keyboard/Retries';
import type { Situs } from '../selection/Situs';

import { BeforeAfter, type BeforeAfterFailureConstructor } from './BeforeAfter';

export interface KeyDirection {
  traverse: (element: SugarElement<Node>) => Optional<SugarElement<Node & ChildNode>>;
  gather: (element: SugarElement<Node>, isRoot: (e: SugarElement<Node>) => boolean) => Optional<SugarElement<Node>>;
  relative: (element: SugarElement<Node>) => Situ;
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
