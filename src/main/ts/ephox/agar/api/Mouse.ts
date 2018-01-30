import Chain from './Chain';
import Step from './Step';
import UiFinder from './UiFinder';
import Clicks from '../mouse/Clicks';
import { Focus } from '@ephox/sugar';

var triggerWith = function (container, selector, action) {
  return Step.async(function (next, die) {
    var element = UiFinder.findIn(container, selector);
    element.fold(function () {
      die(new Error('Could not find element: ' + selector));
    }, function (elem) {
      action(elem);
      next();
    });
  });
};

var trueClick = function (elem) {
  // The closest event queue to a true Click
  Focus.focus(elem);
  Clicks.mousedown(elem);
  Clicks.mouseup(elem);
  Clicks.trigger(elem);
};

var sClickOn = function (container, selector) {
  return triggerWith(container, selector, Clicks.trigger);
};

var sHoverOn = function (container, selector) {
  return triggerWith(container, selector, function (elem) {
    Clicks.mouseover(elem);
  });
};

var sTrueClickOn = function (container, selector) {
  return triggerWith(container, selector, trueClick);
};

var sContextMenuOn = function (container, selector) {
  return triggerWith(container, selector, Clicks.contextmenu);
};

var cClick = Chain.op(function (element) {
  Clicks.trigger(element);
});

var cClickOn = function (selector) {
  return Chain.on(function (container, next, die) {
    triggerWith(container, selector, Clicks.trigger)({}, function (v) {
      next(Chain.wrap(container));
    }, die);
  });
};

var cMouseUpTo = function (dx, dy) {
  return Chain.op(Clicks.mouseupTo(dx, dy));
};

var cMouseMoveTo = function (dx, dy) {
  return Chain.op(Clicks.mousemoveTo(dx, dy));
};

export default {
  sClickOn: sClickOn,
  sTrueClickOn: sTrueClickOn,
  sHoverOn: sHoverOn,
  sContextMenuOn: sContextMenuOn,

  cClick: cClick,
  cClickOn: cClickOn,
  cTrueClick: Chain.op(trueClick),
  cContextMenu: Chain.op(Clicks.contextmenu),
  cMouseOver: Chain.op(Clicks.mouseover),
  cMouseDown: Chain.op(Clicks.mousedown),
  cMouseUp: Chain.op(Clicks.mouseup),
  cMouseUpTo: cMouseUpTo,
  cMouseMove: Chain.op(Clicks.mousemove),
  cMouseMoveTo: cMouseMoveTo,
  cMouseOut: Chain.op(Clicks.mouseout)
};