/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Storage from '../core/Storage';
import { Fun } from '@ephox/katamari';

const get = (editor) => ({
  hasDraft: Fun.curry1_1(Storage.hasDraft, editor),
  storeDraft: Fun.curry1_1(Storage.storeDraft, editor),
  restoreDraft: Fun.curry1_1(Storage.restoreDraft, editor),
  removeDraft: Fun.curry1_2(Storage.removeDraft, editor),
  isEmpty: Fun.curry1_2(Storage.isEmpty, editor)
});

export {
  get
};
