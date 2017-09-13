/**
 * NotificationManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.ui.NotificationManagerImpl',
  [
  ],
  function () {
    return function () {
      var unimplemented = function () {
        throw new Error('Theme did not provide a NotificationManager implementation.');
      };

      return {
        open: unimplemented,
        close: unimplemented,
        reposition: unimplemented,
        getArgs: unimplemented
      };
    };
  }
);
