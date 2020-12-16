/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as CursorRefresh from '../../touch/focus/CursorRefresh';
import * as IosScrolling from '../scroll/IosScrolling';
import * as DeviceZones from './DeviceZones';

const scrollIntoView = (cWin, socket, dropup, top, bottom) => {
  const greenzone = DeviceZones.getGreenzone(socket, dropup);
  const refreshCursor = Fun.curry(CursorRefresh.refresh, cWin);

  if (top > greenzone || bottom > greenzone) {
    IosScrolling.moveOnlyScroll(socket, socket.dom.scrollTop - greenzone + bottom).get(refreshCursor);
  } else if (top < 0) {
    IosScrolling.moveOnlyScroll(socket, socket.dom.scrollTop + top).get(refreshCursor);
  } else {
    // do nothing
  }
};

export {
  scrollIntoView
};
