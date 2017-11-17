/**
 * InsertNewLine.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.newline.InsertNewLine',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.newline.InsertBlock',
    'tinymce.core.newline.InsertBr',
    'tinymce.core.newline.NewLineAction'
  ],
  function (Fun, InsertBlock, InsertBr, NewLineAction) {
    var insert = function (editor, evt) {
      NewLineAction.getAction(editor, evt).fold(
        function () {
          InsertBr.insert(editor, evt);
        },
        function () {
          InsertBlock.insert(editor, evt);
        },
        Fun.noop
      );
    };

    return {
      insert: insert
    };
  }
);
