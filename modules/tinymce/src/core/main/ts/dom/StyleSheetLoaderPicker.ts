import { Document, Element, ShadowDom } from '@ephox/sugar';
import { StyleSheetLoader } from './StyleSheetLoader';
import { Node as DomNode } from '@ephox/dom-globals';
import { RootNode } from '@ephox/sugar/lib/main/ts/ephox/sugar/api/node/ShadowDom';

export const ui = (referenceElement: DomNode | null): StyleSheetLoader => {
  // TODO: can referenceElement ever be null?
  const root: RootNode =
    referenceElement
      ? ShadowDom.getRootNode(Element.fromDom(referenceElement))
      : Document.getDocument();

  return StyleSheetLoader(root.dom());
};
