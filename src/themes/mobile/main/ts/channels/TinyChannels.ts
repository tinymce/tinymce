/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const formatChanged = 'formatChanged';
const orientationChanged = 'orientationChanged';
const dropupDismissed = 'dropupDismissed';

export default {
  formatChanged: Fun.constant(formatChanged),
  orientationChanged: Fun.constant(orientationChanged),
  dropupDismissed: Fun.constant(dropupDismissed)
};