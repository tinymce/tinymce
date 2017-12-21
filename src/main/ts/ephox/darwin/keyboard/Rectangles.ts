import Carets from './Carets';
import { Option } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import { Awareness } from '@ephox/sugar';

var getPartialBox = function (bridge, element, offset) {
  if (offset >= 0 && offset < Awareness.getEnd(element)) return bridge.getRangedRect(element, offset, element, offset+1);
  else if (offset > 0) return bridge.getRangedRect(element, offset - 1, element, offset);
  return Option.none();
};

var toCaret = function (rect) {
  return Carets.nu({
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom
  });
};

var getElemBox = function (bridge, element) {
  return Option.some(bridge.getRect(element));
};

var getBoxAt = function (bridge, element, offset) {
  // Note, we might need to consider this offset and descend.
  if (Node.isElement(element)) return getElemBox(bridge, element).map(toCaret);
  else if (Node.isText(element)) return getPartialBox(bridge, element, offset).map(toCaret);
  else return Option.none();
};

var getEntireBox = function (bridge, element) {
  if (Node.isElement(element)) return getElemBox(bridge, element).map(toCaret);
  else if (Node.isText(element)) return bridge.getRangedRect(element, 0, element, Awareness.getEnd(element)).map(toCaret);
  else return Option.none();
};

export default <any> {
  getBoxAt: getBoxAt,
  getEntireBox: getEntireBox
};