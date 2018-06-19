import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Compare from '../api/dom/Compare';
import Element from '../api/node/Element';

interface Polling {
  element: Element,
  unbind: () => void
}

/*
  Used to monitor elements and ensure that only one monitor is running at a time per element. It also
  guarantees that the unbind function will be called when monitoring is ended.

  This list is shared across the entire page, so be wary of memory leaks when using it.
 */
var polls: Polling[] = [];

var poll = function (element: Element, unbind: () => void): Polling {
  return {
    element: element,
    unbind: unbind
  };
};

var findPoller = function (element: Element) {
  return Arr.findIndex(polls, function (p) {
    return Compare.eq(p.element, element);
  }).getOr(-1);
};

var begin = function (element: Element, f: () => (() => void)) {
  var index = findPoller(element);
  if (index === -1) {
    var unbind = f();
    polls.push(poll(element, unbind));
  }
};

var query = function (element: Element) {
  // Used in tests to determine whether an element is still being monitored
  var index = findPoller(element);
  return index === -1 ? Option.none<Polling>() : Option.some(polls[index]);
};

var end = function (element: Element) {
  var index = findPoller(element);

  // This function is called speculatively, so just do nothing if there is no monitor for the element
  if (index === -1) return;

  var poller = polls[index];
  polls.splice(index, 1);
  poller.unbind();
};

export default {
  begin,
  query,
  end,
};