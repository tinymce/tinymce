/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  '{$targetId}',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('{$globalId}');
  }
);
