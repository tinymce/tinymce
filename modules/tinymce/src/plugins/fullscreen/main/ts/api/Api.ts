/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import { ScrollInfo } from '../core/Actions';

const get = (fullscreenState: Cell<ScrollInfo | null>) => {
  return {
    isFullscreen: () => fullscreenState.get() !== null
  };
};

export {
  get
};
