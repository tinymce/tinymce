/**
 * ToggleFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.ToggleFormat',
  [
    'tinymce.core.fmt.ApplyFormat',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.fmt.RemoveFormat'
  ],
  function (ApplyFormat, MatchFormat, RemoveFormat) {
    var toggle = function (editor, formats, name, vars, node) {
      var fmt = formats.get(name);

      if (MatchFormat.match(editor, name, vars, node) && (!('toggle' in fmt[0]) || fmt[0].toggle)) {
        RemoveFormat.remove(editor, name, vars, node);
      } else {
        ApplyFormat.applyFormat(editor, name, vars, node);
      }
    };

    return {
      toggle: toggle
    };
  }
);
