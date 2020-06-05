/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

export interface DomModifier {
  setAttrib: (attr: string, value: string) => void;
  setStyle: (prop: string, value: string) => void;
  setFormat: (formatName: string, value: string) => void;
}

// The get node is required here because it can be transformed
// when switching between tags (e.g. th and td)
const modifiers = (testTruthy: boolean) => (editor: Editor, node: Node): DomModifier => {
  const dom = editor.dom;

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

  const setFormat = (formatName: string, value: string) => {
    if (!testTruthy || value) {
      // Remove format if given an empty string
      if (value === '') {
        editor.formatter.remove(formatName, { value: null }, node, true);
      } else {
        editor.formatter.apply(formatName, { value }, node);
      }
    }
  };

  return {
    setAttrib,
    setStyle,
    setFormat
  };
};

export const DomModifier = {
  normal: modifiers(false),
  ifTruthy: modifiers(true)
};
