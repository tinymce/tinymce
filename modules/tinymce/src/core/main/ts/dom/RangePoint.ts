/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Env from '../api/Env';
import * as ClientRect from '../geom/ClientRect';
import NodeType from './NodeType';

const isXYWithinRange = function (clientX: number, clientY: number, range: Range): boolean {
  if (range.collapsed) {
    return false;
  }

  // IE 11 incorrectly returns an empty client rect list if a single element is selected.
  // So use the element client rects directly instead of using the range.
  if (Env.browser.isIE() && range.startOffset === range.endOffset - 1 && range.startContainer === range.endContainer) {
    const elm = range.startContainer.childNodes[range.startOffset];
    if (NodeType.isElement(elm)) {
      return Arr.exists(elm.getClientRects(), (rect) => ClientRect.containsXY(rect, clientX, clientY));
    }
  }

  return Arr.exists(range.getClientRects(), (rect) => ClientRect.containsXY(rect, clientX, clientY));
};

export default {
  isXYWithinRange
};
