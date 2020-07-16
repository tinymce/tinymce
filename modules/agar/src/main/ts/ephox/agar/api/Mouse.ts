import { Fun } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

import * as Clicks from '../mouse/Clicks';
import { Chain } from './Chain';
import * as UiFinder from './UiFinder';

// Custom event creation
const cClickWith = Fun.compose(Chain.op, Clicks.click);
const cContextMenuWith = Fun.compose(Chain.op, Clicks.contextMenu);
const cMouseOverWith = Fun.compose(Chain.op, Clicks.mouseOver);
const cMouseDownWith = Fun.compose(Chain.op, Clicks.mouseDown);
const cMouseUpWith = Fun.compose(Chain.op, Clicks.mouseUp);
const cMouseMoveWith = Fun.compose(Chain.op, Clicks.mouseMove);
const cMouseOutWith = Fun.compose(Chain.op, Clicks.mouseOut);

// With delta position (shifted relative to top-left of component)
/**
 * @deprecated use cMouseUpWith({ dx, dy }) instead */
const cMouseUpTo = (dx: number, dy: number) => cMouseUpWith({ dx, dy });
/**
 * @deprecated use cMouseMoveWith({ dx, dy }) instead */
const cMouseMoveTo = (dx: number, dy: number) => cMouseMoveWith({ dx, dy });

// No extra settings
/**
 * @deprecated use cClickWith({ }) instead*/
const cClick = cClickWith({ });
/**
 * @deprecated use cContextMenuWith({ }) instead */
const cContextMenu = cContextMenuWith({ });
/**
 * @deprecated use cMouseOverWith({ }) instead */
const cMouseOver = cMouseOverWith({ });
/**
 * @deprecated use cMouseDownWith({ }) instead */
const cMouseDown = cMouseDownWith({ });
/**
 * @deprecated use cMouseUpWith({ }) instead */
const cMouseUp = cMouseUpWith({ });
/**
 * @deprecated use cMouseMoveWith({ }) instead */
const cMouseMove = cMouseMoveWith({ });
/**
 * @deprecated use cMouseOutWith({ }) instead */
const cMouseOut = cMouseOutWith({ });

// Work with selectors
const sTriggerOn = <T>(container: SugarElement, selector: string, action: (ele: SugarElement) => void) =>
  Chain.asStep<T, SugarElement>(container, [ Chain.async<SugarElement, SugarElement>((container, next, die) => {
    UiFinder.findIn(container, selector).fold(
      () => die('Could not find element: ' + selector),
      (ele) => {
        action(ele);
        next(container);
      }
    );
  }) ]);

const sClickOn = <T>(container: SugarElement, selector: string) => sTriggerOn<T>(container, selector, Clicks.trigger);

const sHoverOn = <T>(container: SugarElement, selector: string) =>
  sTriggerOn<T>(container, selector, Clicks.mouseOver({ }));

const sContextMenuOn = <T>(container: SugarElement, selector: string) =>
  sTriggerOn<T>(container, selector, Clicks.contextMenu({ }));

const cClickOn = (selector: string): Chain<SugarElement, SugarElement> => Chain.fromIsolatedChains([
  UiFinder.cFindIn(selector),
  cClick
]);

// True click utilities: mouse down / mouse up / click events all in one
const trueClick = (elem: SugarElement) => {
  // The closest event queue to a true Click
  Focus.focus(elem);
  Clicks.mouseDown({ })(elem);
  Clicks.mouseUp({ })(elem);
  Clicks.trigger(elem);
};
const cTrueClick = Chain.op(trueClick);
const sTrueClickOn = <T>(container: SugarElement, selector: string) => sTriggerOn<T>(container, selector, trueClick);

// Low level exports
const leftClickButton = Clicks.leftClickButton ;
const middleClickButton = Clicks.middleClickButton ;
const rightClickButton = Clicks.rightClickButton ;
const leftClickButtons = Clicks.leftClickButtons ;
const rightClickButtons = Clicks.rightClickButtons ;
const middleClickButtons = Clicks.middleClickButtons ;
/**
 * @deprecated Use event instead */
const point = Clicks.point;
const event = Clicks.event;

export {
  cClickWith,
  cContextMenuWith,
  cMouseOverWith,
  cMouseDownWith,
  cMouseUpWith,
  cMouseMoveWith,
  cMouseOutWith,

  cClick,
  cContextMenu,
  cMouseOver,
  cMouseDown,
  cMouseUp,
  cMouseMove,
  cMouseOut,

  cMouseUpTo,
  cMouseMoveTo,

  sClickOn,
  sHoverOn,
  sContextMenuOn,
  cClickOn,

  cTrueClick,
  sTrueClickOn,

  leftClickButton,
  middleClickButton,
  rightClickButton,
  leftClickButtons,
  rightClickButtons,
  middleClickButtons,

  point,
  event
};
