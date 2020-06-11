import { Document, Element, ShadowDom } from '@ephox/sugar';
import { StyleSheetLoader } from './StyleSheetLoader';
import { Node as DomNode } from '@ephox/dom-globals';

export const ui = (referenceElement: DomNode | null): StyleSheetLoader => {
  // TODO: can referenceElement ever be null?
  const root =
    referenceElement
      ? ShadowDom.getRootNode(Element.fromDom(referenceElement))
      : Document.getDocument();

  return StyleSheetLoader(root.dom());
};
