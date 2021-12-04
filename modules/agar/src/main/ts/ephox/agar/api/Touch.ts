import { Focus, SugarElement } from '@ephox/sugar';

import * as Touches from '../touch/Touches';
import { Chain } from './Chain';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

const touchStart = Touches.touchstart;
const touchStartAt = (element: SugarElement<Node>, dx: number, dy: number): void => Touches.touchstartAt(dx, dy)(element);
const touchEnd = Touches.touchend;
const touchEndAt = (element: SugarElement<Node>, dx: number, dy: number): void => Touches.touchendAt(dx, dy)(element);
const touchMove = Touches.touchmove;
const touchMoveTo = (element: SugarElement<Node>, dx: number, dy: number): void => Touches.touchmoveTo(dx, dy)(element);

const cTrigger = <T extends Node, U extends Element>(selector: string, action: (ele: SugarElement<U>) => void) =>
  Chain.async<SugarElement<T>, SugarElement<T>>((container, next, die) => {
    UiFinder.findIn<U>(container, selector).fold(
      () => die('Could not find element: ' + selector),
      (ele) => {
        action(ele);
        next(container);
      }
    );
  });

const sTriggerWith = <T, U extends Element>(container: SugarElement<Node>, selector: string, action: (ele: SugarElement<U>) => void) =>
  Chain.asStep<T, SugarElement<Node>>(container, [ cTrigger<Node, U>(selector, action) ]);

const trueTap = (elem: SugarElement<HTMLElement>): void => {
  // The closest event queue to a true tap event
  Focus.focus(elem);
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const tap = (elem: SugarElement<Node>): void => {
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const sTap = <T>(element: SugarElement<Node>): Step<T, T> =>
  Step.sync<T>(() => tap(element));

const sTrueTapOn = <T>(container: SugarElement<Node>, selector: string): Step<T, T> =>
  sTriggerWith<T, HTMLElement>(container, selector, trueTap);

const sTapOn = <T>(container: SugarElement<Node>, selector: string): Step<T, T> =>
  sTriggerWith<T, Element>(container, selector, tap);

const cTapOn = <T extends Node>(selector: string): Chain<SugarElement<T>, SugarElement<T>> =>
  cTrigger(selector, tap);

const cTouchStartAt = <T extends Node>(dx: number, dy: number): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op<SugarElement<T>>(Touches.touchstartAt(dx, dy));

const cTouchEndAt = <T extends Node>(dx: number, dy: number): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op<SugarElement<T>>(Touches.touchendAt(dx, dy));

const cTouchMoveTo = <T extends Node>(dx: number, dy: number): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op<SugarElement<T>>(Touches.touchmoveTo(dx, dy));

const point = Touches.point;

const cTrueTap = Chain.op(trueTap);
const cTap = Chain.op(tap);
const cTouchMove = Chain.op(Touches.touchmove);
const cTouchStart = Chain.op(Touches.touchstart);
const cTouchEnd = Chain.op(Touches.touchend);

export {
  point,

  tap,
  trueTap,

  touchStart,
  touchStartAt,
  touchEnd,
  touchEndAt,
  touchMove,
  touchMoveTo,

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
