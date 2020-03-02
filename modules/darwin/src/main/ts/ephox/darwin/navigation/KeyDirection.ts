import { DomGather } from '@ephox/phoenix';
import { Situ, Traverse, Element } from '@ephox/sugar';
import { Retries } from '../keyboard/Retries';
import { BeforeAfter, BeforeAfterFailureConstructor } from './BeforeAfter';
import { Option } from '@ephox/katamari';
import { WindowBridge } from '../api/WindowBridge';
import { Carets } from '../keyboard/Carets';
import { Situs } from '../selection/Situs';

export interface KeyDirection {
  traverse: (element: Element) => Option<Element>;
  gather: (element: Element, isRoot: (e: Element) => boolean) => Option<Element>;
  relative: (element: Element) => Situ;
  otherRetry: (bridge: WindowBridge, caret: Carets) => Option<Situs>;
  ieRetry: (bridge: WindowBridge, caret: Carets) => Option<Situs>;
  failure: BeforeAfterFailureConstructor;
}

const down: KeyDirection = {
  traverse: Traverse.nextSibling,
  gather: DomGather.after,
  relative: Situ.before,
  otherRetry: Retries.tryDown,
  ieRetry: Retries.ieTryDown,
  failure: BeforeAfter.failedDown
};

const up: KeyDirection = {
  traverse: Traverse.prevSibling,
  gather: DomGather.before,
  relative: Situ.before,
  otherRetry: Retries.tryUp,
  ieRetry: Retries.ieTryUp,
  failure: BeforeAfter.failedUp
};

export {
  down,
  up
};
