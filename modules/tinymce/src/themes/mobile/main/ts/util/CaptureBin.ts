/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Css, Element, Focus, Insert, Remove } from '@ephox/sugar';
import { HTMLInputElement, Node as DomNode } from '@ephox/dom-globals';

const input = (parent: Element<DomNode>, operation: (e: Element<HTMLInputElement>) => void): void => {
  // to capture focus allowing the keyboard to remain open with no 'real' selection
  const input: Element<HTMLInputElement> = Element.fromTag('input');
  Css.setAll(input, {
    opacity: '0',
    position: 'absolute',
    top: '-1000px',
    left: '-1000px'
  });
  Insert.append(parent, input);

  Focus.focus(input);
  operation(input);
  Remove.remove(input);
};

export {
  input
};
