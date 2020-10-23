/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const setup = Fun.noop;
const isDocked = Fun.never;
const getBehaviours = Fun.constant([]);

export {
  setup,
  isDocked,
  getBehaviours
};
