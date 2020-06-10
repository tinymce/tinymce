import { Option } from '@ephox/katamari';
import { Element, ShadowDom } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import { StyleSheetLoader } from './StyleSheetLoader';
import { Node as DomNode } from '@ephox/dom-globals';

export const ui = (referenceElement: DomNode | null): StyleSheetLoader =>
  // TODO: can referenceElement ever be null?
  Option.from(referenceElement)
    .map(Element.fromDom)
    .bind(ShadowDom.getShadowRoot)
    .fold(
      () => DOMUtils.DOM.styleSheetLoader, // TODO: should we just create one here?
      (sr) => StyleSheetLoader(sr.dom()) // TODO: do we need to pass any options here?
    );
