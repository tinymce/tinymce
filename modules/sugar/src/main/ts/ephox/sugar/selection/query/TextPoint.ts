import { ClientRect, Document, DOMRect, Range } from '@ephox/dom-globals';
import { Option, Options } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Text from '../../api/node/Text';
import * as Geometry from '../alien/Geometry';

const locateOffset = function (doc: Element, textnode, x: number, y: number, rect: ClientRect | DOMRect) {
  const rangeForOffset = function (o) {
    const r: Range = (doc.dom() as Document).createRange();
    r.setStart(textnode.dom(), o);
    r.collapse(true);
    return r;
  };

  const rectForOffset = function (o: number) {
    const r = rangeForOffset(o);
    return r.getBoundingClientRect();
  };

  const length = Text.get(textnode).length;
  const offset = Geometry.searchForPoint(rectForOffset, x, y, rect.right, length);
  return rangeForOffset(offset);
};

const locate = function (doc: Element, node: Element, x: number, y: number) {
  const r = (doc.dom() as Document).createRange();
  r.selectNode(node.dom());
  const rects = r.getClientRects();
  const foundRect = Options.findMap(rects as any, function (rect: ClientRect) {
    return Geometry.inRect(rect, x, y) ? Option.some(rect) : Option.none();
  });

  return foundRect.map(function (rect) {
    return locateOffset(doc, node, x, y, rect);
  });
};

export { locate };
