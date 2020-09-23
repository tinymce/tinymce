import { Focus, SugarElement } from '@ephox/sugar';

import * as Touches from '../touch/Touches';
import { Chain } from './Chain';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

const cTrigger = (selector: string, action: (ele: SugarElement<any>) => void) => Chain.async<SugarElement, SugarElement>((container, next, die) => {
  UiFinder.findIn(container, selector).fold(
    () => die('Could not find element: ' + selector),
    (ele) => {
      action(ele);
      next(container);
    }
  );
});

const sTriggerWith = <T>(container: SugarElement<any>, selector: string, action: (ele: SugarElement<any>) => void) => Chain.asStep<T, SugarElement>(container, [ cTrigger(selector, action) ]);

const trueTap = (elem: SugarElement<any>) => {
  // The closest event queue to a true tap event
  Focus.focus(elem);
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const tap = (elem: SugarElement<any>) => {
  Touches.touchstart(elem);
  Touches.touchend(elem);
};

const sTap = <T>(element: SugarElement<any>) => Step.sync<T>(() => tap(element));

const sTrueTapOn = <T>(container: SugarElement<any>, selector: string) => sTriggerWith<T>(container, selector, trueTap);

const sTapOn = <T>(container: SugarElement<any>, selector: string) => sTriggerWith<T>(container, selector, tap);

const cTapOn = (selector: string): Chain<SugarElement, SugarElement> => cTrigger(selector, tap);

const cTouchStartAt = (dx: number, dy: number) => Chain.op(Touches.touchstartAt(dx, dy));

const cTouchEndAt = (dx: number, dy: number) => Chain.op(Touches.touchendAt(dx, dy));

const cTouchMoveTo = (dx: number, dy: number) => Chain.op(Touches.touchmoveTo(dx, dy));

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
