import { Location } from '@ephox/sugar';

var LEFT_CLICK = 0;
var RIGHT_CLICK = 2;

// Note: This can be used for phantomjs.
var trigger = function (element) {
  if (element.dom().click !== undefined) return element.dom().click();
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  point('click', LEFT_CLICK, element, 0, 0);
};

var point = function (type, button, element, x, y) {
  // Adapted from: http://stackoverflow.com/questions/17468611/triggering-click-event-phantomjs
  var ev = element.dom().ownerDocument.createEvent('MouseEvents');
  ev.initMouseEvent(
      type,
      true /* bubble */, true /* cancelable */,
      window, null,
      x, y, x, y, /* coordinates */
      false, false, false, false, /* modifier keys */
      button, null
  );
  element.dom().dispatchEvent(ev);
};

var click = function (eventType, button) {
  return function (element) {
    var position = Location.absolute(element);
    point(eventType, button, element, position.left(), position.top());
  }
}

var clickAt = function (eventType, button) {
  return function (dx, dy) {
    return function (element) {
      var position = Location.absolute(element);
      point(eventType, button, element, position.left() + dx, position.top() + dy);
    }
  }
}

export default {
  trigger: trigger,
  mousedown: click('mousedown', LEFT_CLICK),
  mouseup: click('mouseup', LEFT_CLICK),
  mouseupTo: clickAt('mouseup', LEFT_CLICK),
  mousemove:click('mousemove', LEFT_CLICK),
  mousemoveTo:clickAt('mousemove', LEFT_CLICK),
  mouseover: click('mouseover', LEFT_CLICK),
  mouseout: click('mouseout', LEFT_CLICK),
  contextmenu: click('contextmenu', RIGHT_CLICK)
};