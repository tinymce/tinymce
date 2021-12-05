import { Optional } from '@ephox/katamari';
import { Awareness, RawRect, SugarElement, SugarNode } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';
import * as Carets from './Carets';

type Carets = Carets.Carets;

const getPartialBox = (bridge: WindowBridge, element: SugarElement<Node>, offset: number) => {
  if (offset >= 0 && offset < Awareness.getEnd(element)) {
    return bridge.getRangedRect(element, offset, element, offset + 1);
  } else if (offset > 0) {
    return bridge.getRangedRect(element, offset - 1, element, offset);
  }
  return Optional.none<RawRect>();
};

const toCaret = (rect: RawRect): Carets => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom
});

const getElemBox = (bridge: WindowBridge, element: SugarElement<Element>) => {
  return Optional.some(bridge.getRect(element));
};

const getBoxAt = (bridge: WindowBridge, element: SugarElement<Node>, offset: number): Optional<Carets> => {
  // Note, we might need to consider this offset and descend.
  if (SugarNode.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (SugarNode.isText(element)) {
    return getPartialBox(bridge, element, offset).map(toCaret);
  } else {
    return Optional.none<Carets>();
  }
};

const getEntireBox = (bridge: WindowBridge, element: SugarElement<Node>): Optional<Carets> => {
  if (SugarNode.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (SugarNode.isText(element)) {
    return bridge.getRangedRect(element, 0, element, Awareness.getEnd(element)).map(toCaret);
  } else {
    return Optional.none<Carets>();
  }
};

export {
  getBoxAt,
  getEntireBox
};
