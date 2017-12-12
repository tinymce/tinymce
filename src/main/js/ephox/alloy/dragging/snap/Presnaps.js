import { Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';

// NOTE: Moved from ego with some parameterisation
var get = function (component, dockInfo) {
  var element = component.element();
  var x = parseInt(Attr.get(element, dockInfo.leftAttr()), 10);
  var y = parseInt(Attr.get(element, dockInfo.topAttr()), 10);
  return isNaN(x) || isNaN(y) ? Option.none() : Option.some(
    Position(x, y)
  );
};

var set = function (component, dockInfo, pt) {
  var element = component.element();
  Attr.set(element, dockInfo.leftAttr(), pt.left() + 'px');
  Attr.set(element, dockInfo.topAttr(), pt.top() + 'px');
};

var clear = function (component, dockInfo) {
  var element = component.element();
  Attr.remove(element, dockInfo.leftAttr());
  Attr.remove(element, dockInfo.topAttr());
};

export default <any> {
  get: get,
  set: set,
  clear: clear
};