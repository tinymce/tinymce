import { setTimeout, window, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import * as Monitors from '../../impl/Monitors';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as Height from '../view/Height';
import * as Visibility from '../view/Visibility';
import * as Width from '../view/Width';
import * as DomEvent from './DomEvent';
import * as Viewable from './Viewable';
import { EventUnbinder } from './Types';

interface Monitored {
  element: Element<HTMLElement>;
  handlers: Array<() => void>;
  lastWidth: number;
  lastHeight: number;
}

const elem = function (element: Element<HTMLElement>): Monitored {
  return {
    element,
    handlers: [],
    lastWidth: Width.get(element),
    lastHeight: Height.get(element)
  };
};
const elems: Monitored[] = [];

const findElem = function (element: Element<DomNode>) {
  return Arr.findIndex(elems, function (el) {
    return Compare.eq(el.element, element);
  }).getOr(-1);
};

const bind = function (element: Element<HTMLElement>, handler: () => void) {
  let el = Arr.find(elems, function (elm) {
    return Compare.eq(elm.element, element);
  }).getOrUndefined();
  if (el === undefined) {
    el = elem(element);
    elems.push(el);
  }
  el.handlers.push(handler);
  if (interval.isNone()) {
    start();
  }

  // Fire an update event for this element on every bind call.
  // This is really handy if the element is currently hidden, the resize event
  // will fire as soon as it becomes visible.
  setTimeout(function () {
    // Ensure we don't attempt to update something that is unbound in the 100ms since the bind call
    if (findElem(el.element) !== -1) {
      update(el);
    }
  }, 100);
};

const unbind = function (element: Element<DomNode>, handler: () => void) {
  // remove any monitors on this element
  Monitors.end(element);
  const index = findElem(element);
  if (index === -1) {
    return;
  }

  const handlerIndex = Arr.indexOf(elems[index].handlers, handler);
  if (handlerIndex.isNone()) {
    return;
  }

  elems[index].handlers.splice(handlerIndex.getOr(0), 1);
  if (elems[index].handlers.length === 0) {
    elems.splice(index, 1);
  }
  if (elems.length === 0) {
    stop();
  }
};

const visibleUpdate = function (el: Monitored) {
  const w = Width.get(el.element);
  const h = Height.get(el.element);
  if (w !== el.lastWidth || h !== el.lastHeight) {
    el.lastWidth = w;
    el.lastHeight = h;
    Arr.each(el.handlers, Fun.apply);
  }
};

const update = function (el: Monitored) {
  const element = el.element;
  // if already visible, run the update
  if (Visibility.isVisible(element)) {
    visibleUpdate(el);
  } else {
    Monitors.begin(element, function () {
      // the monitor is "wait for viewable"
      return Viewable.onShow(element, function () {
        Monitors.end(element);
        visibleUpdate(el);
      });
    });
  }
};

// Don't use peanut Throttler, requestAnimationFrame is much much better than setTimeout for resize/scroll events:
// http://www.html5rocks.com/en/tutorials/speed/animations/
let throttle = false;
const runHandler = function () {
  throttle = false;
  // cancelAnimationFrame isn't stable yet, so we can't pass events to the callback (they would be out of date)
  Arr.each(elems, update);
};

const listener = function () {
  // cancelAnimationFrame isn't stable yet, so we just ignore all subsequent events until the next animation frame
  if (!throttle) {
    throttle = true;
    window.requestAnimationFrame(runHandler);
  }
};

let interval = Option.none<EventUnbinder>();
const start = function () {
  interval = Option.some(DomEvent.bind(Element.fromDom(window), 'resize', listener));
};

const stop = function () {
  interval.each(function (f) {
    f.unbind();
    interval = Option.none();
  });
};

export { bind, unbind, };
