/**
 * BlockBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockBoundaryDelete',
  [
  ],
  function (Fun, Option, Options, Struct, CaretFinder, CaretPosition) {
    var backspaceDelete = function (editor, forward) {
      return false;
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
