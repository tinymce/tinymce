/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

export interface DomModifier {
  setAttrib: (attr: string, value: string) => void;
  setStyle: (prop: string, value: string) => void;
}

// The get node is required here because it can be transformed
// when switching between tags (e.g. th and td)
const modifiers = (testTruthy: boolean) => (dom: DOMUtils, node: Node): DomModifier => {
  const setAttrib = (attr: string, value: string) => {
    if (!testTruthy || value) {
      dom.setAttrib(node, attr, value);
    }
  };

  const setStyle = (prop: string, value: string) => {
    if (!testTruthy || value) {
      dom.setStyle(node, prop, value);
    }
  };

  return {
    setAttrib,
    setStyle
  };
};

export const DomModifier = {
  normal: modifiers(false),
  ifTruthy: modifiers(true)
};
