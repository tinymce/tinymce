import { Option } from '@ephox/katamari';
import { Attr, Position } from '@ephox/sugar';

// NOTE: Moved from ego with some parameterisation
const get = function (component, dockInfo) {
  const element = component.element();
  const x = parseInt(Attr.get(element, dockInfo.leftAttr()), 10);
  const y = parseInt(Attr.get(element, dockInfo.topAttr()), 10);
  return isNaN(x) || isNaN(y) ? Option.none() : Option.some(
    Position(x, y)
  );
};

const set = function (component, dockInfo, pt) {
  const element = component.element();
  Attr.set(element, dockInfo.leftAttr(), pt.left() + 'px');
  Attr.set(element, dockInfo.topAttr(), pt.top() + 'px');
};

const clear = function (component, dockInfo) {
  const element = component.element();
  Attr.remove(element, dockInfo.leftAttr());
  Attr.remove(element, dockInfo.topAttr());
};

export {
  get,
  set,
  clear
};