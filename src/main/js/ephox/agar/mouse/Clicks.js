define(
  'ephox.agar.mouse.Clicks',

  [
    'ephox.sugar.api.view.Location'
  ],

  function (Location) {
    // Note: This can be used for phantomjs.
    var trigger = function (element) {
      if (element.dom().click !== undefined) return element.dom().click();
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "click",
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var point = function (element, x, y) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "click",
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var mousedown = function (element) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "mousedown",
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var mouseup = function (element) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "mouseup",
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var mousemove = function (element, x, y) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "mousemove",
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var mouseover = function (element, x, y) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "mouseover",
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      element.dom().dispatchEvent(ev);
    };

    var mouseout = function (element, x, y) {
      // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
      var ev = document.createEvent("MouseEvent");
      ev.initMouseEvent(
          "mouseout",
          true /* bubble */, true /* cancelable */,
          window, null,
          x, y, x, y, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      console.error(ev);
      element.dom().dispatchEvent(ev);
    };

    var contextmenu = function (element) {
      // Adapted from http://stackoverflow.com/questions/433919/javascript-simulate-right-click-through-code
      var evt = element.dom().ownerDocument.createEvent('MouseEvents');
      var RIGHT_CLICK = 2;
      var position = Location.absolute(element);
      var x = position.left();
      var y = position.top();
      evt.initMouseEvent('contextmenu', true, true,
        element.dom().ownerDocument.defaultView, 1, x, y, x, y, false,
        false, false, false, RIGHT_CLICK, null);
      element.dom().dispatchEvent(evt);
    };

    return {
      trigger: trigger,
      mousedown: mousedown,
      mousemove: mousemove,
      mouseup: mouseup,
      mouseover: mouseover,
      mouseout: mouseout,
      contextmenu: contextmenu
    };
  }
);