import { Document, Element as DomElement, HTMLHeadElement, Node as DomNode, ShadowRoot } from '@ephox/dom-globals';
import Element from './Element';
import * as NodeTypes from './NodeTypes';

export interface StyleContainer {
  readonly append: (node: DomNode) => void;
}

const styleContainer = (x: ShadowRoot | HTMLHeadElement): StyleContainer => ({
  append: (node: DomNode) => x.appendChild(node)
});

const styleNode = (e: DomElement): ShadowRoot | HTMLHeadElement => {
  const ea: any = e;
  if (ea.getRootNode) {
    const rn = ea.getRootNode();
    if (rn.nodeType === NodeTypes.DOCUMENT_FRAGMENT) {
      return rn;
    } else {
      return headOf(rn);
    }
  } else {
    return headOf(e.ownerDocument);
  }
};

const headOf = (doc: Document): HTMLHeadElement =>
  doc.getElementsByTagName('head')[0];

export const find = (element: Element<DomElement>): StyleContainer =>
  styleContainer(styleNode(element.dom()));
