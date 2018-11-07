/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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
