/**
 * Selections.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.selection.Selections',

  [
    'ephox.darwin.api.TableSelection',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.selection.Ephemera',
    'tinymce.plugins.table.selection.SelectionTypes'
  ],

  function (TableSelection, Util, Ephemera, SelectionTypes) {
    return function (editor) {
      var get = function () {
        var body = Util.getBody(editor);

        return TableSelection.retrieve(body, Ephemera.selectedSelector()).fold(function () {
          if (editor.selection.getStart() === undefined) {
            return SelectionTypes.none();
          } else {
            return SelectionTypes.single(editor.selection);
          }
        }, function (cells) {
          return SelectionTypes.multiple(cells);
        });
      };

      return {
        get: get
      };
    };
  }
);
