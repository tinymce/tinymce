import { ClientRect, Document, DOMRect, Text as DomText } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Text from '../../api/node/Text';
import * as Geometry from '../alien/Geometry';

const locateOffset = (doc: Element<Document>, textnode: Element<DomText>, x: number, y: number, rect: ClientRect | DOMRect) => {
  const rangeForOffset = (o: number) => {
    const r = doc.dom().createRange();
    r.setStart(textnode.dom(), o);
    r.collapse(true);
    return r;
  };

  const rectForOffset = (o: number) => {
    const r = rangeForOffset(o);
    return r.getBoundingClientRect();
  };

  const length = Text.get(textnode).length;
  const offset = Geometry.searchForPoint(rectForOffset, x, y, rect.right, length);
  return rangeForOffset(offset);
};

const locate = (doc: Element<Document>, node: Element<DomText>, x: number, y: number) => {
  const r = doc.dom().createRange();
  r.selectNode(node.dom());
  const rects = r.getClientRects();
  const foundRect = Arr.findMap<ClientRect | DOMRect, ClientRect | DOMRect>(rects, (rect) =>
    Geometry.inRect(rect, x, y) ? Option.some(rect) : Option.none());

  return foundRect.map((rect) => locateOffset(doc, node, x, y, rect));
};

export { locate };
