/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import StyleSheetLoader, { StyleSheetLoaderSettings } from '../api/dom/StyleSheetLoader';

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
