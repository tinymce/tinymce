import { Option } from '@ephox/katamari';
import { Awareness, Node, Element, RawRect } from '@ephox/sugar';
import { Carets } from './Carets';
import { WindowBridge } from '../api/WindowBridge';

const getPartialBox = function (bridge: WindowBridge, element: Element, offset: number) {
  if (offset >= 0 && offset < Awareness.getEnd(element)) {
    return bridge.getRangedRect(element, offset, element, offset + 1);
  } else if (offset > 0) {
    return bridge.getRangedRect(element, offset - 1, element, offset);
  }
  return Option.none<RawRect>();
};

const toCaret = function (rect: RawRect) {
  return Carets.nu({
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom
  });
};

const getElemBox = function (bridge: WindowBridge, element: Element) {
  return Option.some(bridge.getRect(element));
};

const getBoxAt = function (bridge: WindowBridge, element: Element, offset: number) {
  // Note, we might need to consider this offset and descend.
  if (Node.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (Node.isText(element)) {
    return getPartialBox(bridge, element, offset).map(toCaret);
  } else {
    return Option.none<Carets>();
  }
};

const getEntireBox = function (bridge: WindowBridge, element: Element) {
  if (Node.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (Node.isText(element)) {
    return bridge.getRangedRect(element, 0, element, Awareness.getEnd(element)).map(toCaret);
  } else {
    return Option.none<Carets>();
  }
};

export default {
  getBoxAt,
  getEntireBox
};