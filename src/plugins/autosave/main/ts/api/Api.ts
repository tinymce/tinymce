/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Storage from '../core/Storage';
import { Fun } from '@ephox/katamari';

const get = function (editor) {
  return {
    hasDraft: Fun.curry(Storage.hasDraft, editor),
    storeDraft: Fun.curry(Storage.storeDraft, editor),
    restoreDraft: Fun.curry(Storage.restoreDraft, editor),
    removeDraft: Fun.curry(Storage.removeDraft, editor),
    isEmpty: Fun.curry(Storage.isEmpty, editor)
  };
};

export {
  get
};
