import { Arr, Option } from '@ephox/katamari';
import * as Compare from '../api/dom/Compare';
import Element from '../api/node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

export interface Polling {
  element: Element<DomNode>;
  unbind: () => void;
}

/*
  Used to monitor elements and ensure that only one monitor is running at a time per element. It also
  guarantees that the unbind function will be called when monitoring is ended.

  This list is shared across the entire page, so be wary of memory leaks when using it.
 */
const polls: Polling[] = [];

const poll = function (element: Element<DomNode>, unbind: () => void): Polling {
  return {
    element,
    unbind
  };
};

const findPoller = function (element: Element<DomNode>) {
  return Arr.findIndex(polls, function (p) {
    return Compare.eq(p.element, element);
  }).getOr(-1);
};

const begin = function (element: Element<DomNode>, f: () => (() => void)) {
  const index = findPoller(element);
  if (index === -1) {
    const unbind = f();
    polls.push(poll(element, unbind));
  }
};

const query = function (element: Element<DomNode>) {
  // Used in tests to determine whether an element is still being monitored
  const index = findPoller(element);
  return index === -1 ? Option.none<Polling>() : Option.some(polls[index]);
};

const end = function (element: Element<DomNode>) {
  const index = findPoller(element);

  // This function is called speculatively, so just do nothing if there is no monitor for the element
  if (index === -1) {
    return;
  }

  const poller = polls[index];
  polls.splice(index, 1);
  poller.unbind();
};

export { begin, query, end, };
