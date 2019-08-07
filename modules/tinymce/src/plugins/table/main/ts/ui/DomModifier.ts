/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';

export interface DomModifier {
  setAttrib: (attr: string, value: string) => void;
  setStyle: (prop: string, value: string) => void;
}

// The get node is required here because it can be transformed
// when switching between tags (e.g. th and td)
const normal = (dom, node: Node): DomModifier => {
  const setAttrib = (attr: string, value: string) => {
    dom.setAttrib(node, attr, value);
  };

  const setStyle = (prop: string, value: string) => {
    dom.setStyle(node, prop, value);
  };

  return {
    setAttrib,
    setStyle
  };
};

const ifTruthy = (dom, node: Node): DomModifier => {
  const setAttrib = (attr: string, value: string) => {
    if (value) {
      dom.setAttrib(node, attr, value);
    }
  };

  const setStyle = (prop: string, value: string) => {
    if (value) {
      dom.setStyle(node, prop, value);
    }
  };

  return {
    setAttrib,
    setStyle
  };
};

export const DomModifier = {
  normal,
  ifTruthy
};
