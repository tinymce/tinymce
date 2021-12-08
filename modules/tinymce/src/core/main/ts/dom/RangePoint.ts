/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import * as ClientRect from '../geom/ClientRect';

const isXYWithinRange = (clientX: number, clientY: number, range: Range): boolean => {
  if (range.collapsed) {
    return false;
  } else {
    return Arr.exists(range.getClientRects(), (rect) => ClientRect.containsXY(rect, clientX, clientY));
  }
};

export {
  isXYWithinRange
};
