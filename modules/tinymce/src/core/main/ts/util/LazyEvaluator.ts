/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';

const evaluateUntil = function (fns, args) {
  for (let i = 0; i < fns.length; i++) {
    const result = fns[i].apply(null, args);
    if (result.isSome()) {
      return result;
    }
  }

  return Option.none();
};

export default {
  evaluateUntil
};