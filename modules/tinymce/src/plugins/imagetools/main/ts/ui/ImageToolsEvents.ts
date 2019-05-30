/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const saveState = Fun.constant('save-state');
const disable = Fun.constant('disable');
const enable = Fun.constant('enable');

// TODO: dedupe these from ImageToolsEvents.ts in silver

export {
  saveState,
  disable,
  enable
};