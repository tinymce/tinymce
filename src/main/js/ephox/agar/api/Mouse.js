define(
  'ephox.agar.api.Mouse',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.mouse.Clicks',
    'ephox.sugar.api.dom.Focus',
    'global!Error'
  ],

  function (Chain, Step, UiFinder, Clicks, Focus, Error) {

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
        Clicks.mouseover(elem, 0, 0);
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

    var cTrueClick = Chain.on(function (element, next, die) {
      trueClick(element);
      next(Chain.wrap(element));
    });

    var cContextMenu = Chain.on(function (element, next, die) {
      Clicks.contextmenu(element);
      next(Chain.wrap(element));
    });

    return {
      sClickOn: sClickOn,
      sTrueClickOn: sTrueClickOn,
      sHoverOn: sHoverOn,
      sContextMenuOn: sContextMenuOn,

      cClick: cClick,
      cClickOn: cClickOn,
      cTrueClick: cTrueClick,
      cContextMenu: cContextMenu
    };
  }
);