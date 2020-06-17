/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Document as DomDocument, Node as DomNode, ShadowRoot } from '@ephox/dom-globals';
import { StyleSheetLoader, StyleSheetLoaderSettings } from 'tinymce/core/api/dom/StyleSheetLoader';
import { Element, ShadowDom } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

export interface StyleSheetLoaderRegistry {
  readonly forElement: (referenceElement: Element<DomNode>, settings: Partial<StyleSheetLoaderSettings>) => StyleSheetLoader;
}

/**
 * This function is exported for testing purposes only - please use StyleSheetLoader.instance in production code.
 */
export const create = (): StyleSheetLoaderRegistry => {

  const map = new WeakMap<DomDocument | ShadowRoot, StyleSheetLoader>();

  const forElement = (referenceElement: Element<DomNode>, settings: Partial<StyleSheetLoaderSettings>) => {
    const root = ShadowDom.getRootNode(referenceElement);

    const rootDom = root.dom();
    return Option.from(map.get(rootDom)).getOrThunk(() => {
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
