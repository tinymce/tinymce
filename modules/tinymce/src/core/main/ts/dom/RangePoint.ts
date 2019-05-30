/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import * as ClientRect from '../geom/ClientRect';

const isXYWithinRange = function (clientX, clientY, range) {
  if (range.collapsed) {
    return false;
  }

  return Arr.foldl(range.getClientRects(), function (state, rect) {
    return state || ClientRect.containsXY(rect, clientX, clientY);
  }, false);
};

export default {
  isXYWithinRange
};