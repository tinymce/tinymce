import { document, Document as DomDocument, Node as DomNode, ShadowRoot } from '@ephox/dom-globals';
import { StyleSheetLoader, StyleSheetLoaderSettings } from 'tinymce/core/api/dom/StyleSheetLoader';
import { Element, ShadowDom } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Option } from '@ephox/katamari';

export interface StyleSheetLoaderRegistry {
  readonly forElement: (referenceElement: Element<DomNode>, settings: Partial<StyleSheetLoaderSettings>) => StyleSheetLoader;
}

/**
 * For testing only - please use StyleSheetLoader.instance in production code.
 */
export const create = (): StyleSheetLoaderRegistry => {

  const map = new WeakMap<DomDocument | ShadowRoot, StyleSheetLoader>();

  const forElement = (referenceElement: Element<DomNode>, settings: Partial<StyleSheetLoaderSettings>) => {
    const root = ShadowDom.getRootNode(referenceElement);

    const rootDom = root.dom();
    if (rootDom === document) {
      return DOMUtils.DOM.styleSheetLoader;
    } else {
      return Option.from(map.get(rootDom)).getOrThunk(() => {
        const sl = StyleSheetLoader(rootDom, settings);
        map.set(rootDom, sl);
        return sl;
      });
    }
  };

  return {
    forElement
  };
};

export const instance = create();
