import { Optional } from '@ephox/katamari';
import { type SugarElement, SugarShadowDom } from '@ephox/sugar';

import StyleSheetLoader, { type StyleSheetLoaderSettings } from '../api/dom/StyleSheetLoader';

export interface StyleSheetLoaderRegistry {
  readonly forElement: (referenceElement: SugarElement<Node>, settings: StyleSheetLoaderSettings) => StyleSheetLoader;
}

/**
 * This function is exported for testing purposes only - please use StyleSheetLoader.instance in production code.
 */
export const create = (): StyleSheetLoaderRegistry => {

  const map = new WeakMap<Document | ShadowRoot, StyleSheetLoader>();

  const forElement = (referenceElement: SugarElement<Node>, settings: StyleSheetLoaderSettings) => {
    const root = SugarShadowDom.getRootNode(referenceElement);

    const rootDom = root.dom;
    return Optional.from(map.get(rootDom)).getOrThunk(() => {
      const sl = StyleSheetLoader(rootDom, settings);
      map.set(rootDom, sl);
      return sl;
    });
  };

  return {
    forElement
  };
};

export const instance = create();
