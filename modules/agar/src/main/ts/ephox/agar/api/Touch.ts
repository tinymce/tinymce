import { Element, Focus } from '@ephox/sugar';
import { Step } from '@ephox/agar';

import * as Touches from '../touch/Touches';
import { Chain } from './Chain';
import * as UiFinder from './UiFinder';

const cTrigger = (selector: string, action: (ele: Element<any>) => void) => {
  return Chain.async<Element, Element>((container, next, die) => {
    UiFinder.findIn(container, selector).fold(
      () => die('Could not find element: ' + selector),
      (ele) => {
        action(ele);
        next(container);
      }
    );
  });
};

const sTriggerWith = <T>(container: Element<any>, selector: string, action: (ele: Element<any>) => void) => {
  return Chain.asStep<T, Element>(container, [ cTrigger(selector, action) ]);
};

const trueTap = (elem: Element<any>) => {
  // The closest event queue to a true tap event
  Focus.focus(elem);
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const tap = (elem: Element<any>) => {
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const sTap = <T>(element: Element<any>) => Step.sync<T>(() => tap(element));

const sTrueTapOn = <T>(container: Element<any>, selector: string) => {
  return sTriggerWith<T>(container, selector, trueTap);
};

const sTapOn = <T>(container: Element<any>, selector: string) => {
  return sTriggerWith<T>(container, selector, tap);
};

const cTapOn = (selector: string): Chain<Element, Element> => {
  return cTrigger(selector, tap);
};

const cTouchStartAt = (dx: number, dy: number) => {
  return Chain.op(Touches.touchstartAt(dx, dy));
};

const cTouchEndAt = (dx: number, dy: number) => {
  return Chain.op(Touches.touchendAt(dx, dy));
};

const cTouchMoveTo = (dx: number, dy: number) => {
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
