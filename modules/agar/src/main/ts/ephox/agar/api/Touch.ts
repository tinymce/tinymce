import { Element, Focus } from '@ephox/sugar';
import { Step, TestLogs } from '@ephox/agar';

import { DieFn, NextFn } from '../pipe/Pipe';
import * as Touches from '../touch/Touches';
import { Chain, Wrap } from './Chain';
import * as UiFinder from './UiFinder';

const triggerWith = <T>(container: Element, selector: string, action: (ele: Element) => void) => {
  return Step.async<T>((next, die) => {
    const element = UiFinder.findIn(container, selector);
    element.fold(() => {
      die(new Error('Could not find element: ' + selector));
    }, (elem) => {
      action(elem);
      next();
    });
  });
};

const trueTap = (elem: Element) => {
  // The closest event queue to a true tap event
  Focus.focus(elem);
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const tap = (elem: Element) => {
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const sTap = (element: Element) => Step.sync(() => tap(element));

const sTrueTapOn = <T>(container: Element, selector: string) => {
  return triggerWith<T>(container, selector, trueTap);
};

const sTapOn = <T>(container: Element, selector: string) => {
  return triggerWith<T>(container, selector, tap);
};

const cTapOn = (selector: string): Chain<Element, Element> => {
  return Chain.on((container: Element, next: NextFn<Wrap<Element>>, die: DieFn, initLogs: TestLogs) => {
    triggerWith(container, selector, tap)({}, (v, newLogs) => {
      next(Chain.wrap(container), newLogs);
    }, (err, newLogs) => die(err, newLogs), initLogs);
  });
};

const cTouchStartAt = function (dx: number, dy: number) {
  return Chain.op(Touches.touchstartAt(dx, dy));
};

const cTouchEndAt = function (dx: number, dy: number) {
  return Chain.op(Touches.touchendAt(dx, dy));
};

const cTouchMoveTo = function (dx: number, dy: number) {
  return Chain.op(Touches.touchmoveTo(dx, dy));
};

const point = Touches.point;

const cTrueTap = Chain.op(trueTap);
const cTap = Chain.op(tap);
const cTouchMove = Chain.op(Touches.touchmove);
const cTouchStart = Chain.op(Touches.touchstart);
const cTouchEnd = Chain.op(Touches.touchend);

export {
  point,

  sTap,
  sTapOn,
  sTrueTapOn,

  cTap,
  cTapOn,
  cTrueTap,
  cTouchStart,
  cTouchStartAt,
  cTouchMove,
  cTouchMoveTo,
  cTouchEnd,
  cTouchEndAt
};
