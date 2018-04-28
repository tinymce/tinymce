/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Storage from '../core/Storage';

// Inlined the curry function since adding Fun without tree shaking to every plugin would produce a lot of bloat
const curry = function (f, editor) {
  return function () {
    const args = Array.prototype.slice.call(arguments);
    return f.apply(null, [editor].concat(args));
  };
};

const get = function (editor) {
  return {
    hasDraft: curry(Storage.hasDraft, editor),
    storeDraft: curry(Storage.storeDraft, editor),
    restoreDraft: curry(Storage.restoreDraft, editor),
    removeDraft: curry(Storage.removeDraft, editor),
    isEmpty: curry(Storage.isEmpty, editor)
  };
};

export default {
  get
};