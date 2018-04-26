/**
 * WindowManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

export default function () {
  const unimplemented = function () {
    throw new Error('Theme did not provide a WindowManager implementation.');
  };

  return {
    open: unimplemented,
    alert: unimplemented,
    confirm: unimplemented,
    close: unimplemented,
    getParams: unimplemented,
    setParams: unimplemented
  };
}