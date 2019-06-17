import { Element, Focus } from '@ephox/sugar';

import * as Clicks from '../mouse/Clicks';
import { DieFn, NextFn } from '../pipe/Pipe';
import { Chain, Wrap } from './Chain';
import { Step } from './Step';
import { TestLogs } from './TestLogs';
import * as UiFinder from './UiFinder';

const triggerWith = function <T>(container: Element, selector: string, action: (ele: Element) => void) {
  return Step.async<T>((next, die) => {
    const element = UiFinder.findIn(container, selector);
    element.fold(function () {
      die(new Error('Could not find element: ' + selector));
    }, function (elem) {
      action(elem);
      next();
    });
  });
};

const trueClick = function (elem: Element) {
  // The closest event queue to a true Click
  Focus.focus(elem);
  Clicks.mousedown(elem);
  Clicks.mouseup(elem);
  Clicks.trigger(elem);
};

const sClickOn = function <T>(container: Element, selector: string) {
  return triggerWith<T>(container, selector, Clicks.trigger);
};

const sHoverOn = function <T>(container: Element, selector: string) {
  return triggerWith<T>(container, selector, function (elem) {
    Clicks.mouseover(elem);
  });
};

const sTrueClickOn = function <T>(container: Element, selector: string) {
  return triggerWith<T>(container, selector, trueClick);
};

const sContextMenuOn = function <T>(container: Element, selector: string) {
  return triggerWith<T>(container, selector, Clicks.contextmenu);
};

const cClick = Chain.op(function (element: Element) {
  Clicks.trigger(element);
});

const cClickOn = function (selector: string): Chain<Element, Element> {
  return Chain.on(function (container: Element, next: NextFn<Wrap<Element>>, die: DieFn, initLogs: TestLogs) {
    triggerWith(container, selector, Clicks.trigger)({}, function (v, newLogs) {
      next(Chain.wrap(container), newLogs);
    }, (err, newLogs) => die(err, newLogs), initLogs);
  });
};

const cMouseUpTo = function (dx: number, dy: number) {
  return Chain.op(Clicks.mouseupTo(dx, dy));
};

const cMouseMoveTo = function (dx: number, dy: number) {
  return Chain.op(Clicks.mousemoveTo(dx, dy));
};

const point = Clicks.point;

const cTrueClick = Chain.op(trueClick);
const cContextMenu = Chain.op(Clicks.contextmenu);
const cMouseOver = Chain.op(Clicks.mouseover);
const cMouseDown = Chain.op(Clicks.mousedown);
const cMouseUp = Chain.op(Clicks.mouseup);
const cMouseMove = Chain.op(Clicks.mousemove);
const cMouseOut = Chain.op(Clicks.mouseout);

export {
  point,

  sClickOn,
  sTrueClickOn,
  sHoverOn,
  sContextMenuOn,

  cClick,
  cClickOn,
  cTrueClick,
  cContextMenu,
  cMouseOver,
  cMouseDown,
  cMouseUp,
  cMouseUpTo,
  cMouseMove,
  cMouseMoveTo,
  cMouseOut
};