import { Element, Focus } from '@ephox/sugar';

import * as Clicks from '../mouse/Clicks';
import { Chain } from './Chain';
import * as UiFinder from './UiFinder';

const cTrigger = (selector: string, action: (ele: Element) => void) => Chain.async<Element, Element>((container, next, die) => {
  UiFinder.findIn(container, selector).fold(
    () => die('Could not find element: ' + selector),
    (ele) => {
      action(ele);
      next(container);
    }
  );
});

const sTriggerWith = <T>(container: Element, selector: string, action: (ele: Element) => void) => Chain.asStep<T, Element>(container, [ cTrigger(selector, action) ]);

const trueClick = function (elem: Element) {
  // The closest event queue to a true Click
  Focus.focus(elem);
  Clicks.mousedown(elem);
  Clicks.mouseup(elem);
  Clicks.trigger(elem);
};

const sClickOn = <T>(container: Element, selector: string) => sTriggerWith<T>(container, selector, Clicks.trigger);

const sHoverOn = <T>(container: Element, selector: string) => sTriggerWith<T>(container, selector, Clicks.mouseover);

const sTrueClickOn = <T>(container: Element, selector: string) => sTriggerWith<T>(container, selector, trueClick);

const sContextMenuOn = <T>(container: Element, selector: string) => sTriggerWith<T>(container, selector, Clicks.contextmenu);

const cClickOn = (selector: string): Chain<Element, Element> => cTrigger(selector, Clicks.trigger);

const cMouseUpTo = (dx: number, dy: number) => Chain.op(Clicks.mouseupTo(dx, dy));

const cMouseMoveTo = (dx: number, dy: number) => Chain.op(Clicks.mousemoveTo(dx, dy));

const point = Clicks.point;

const cClick = Chain.op(Clicks.trigger);
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
