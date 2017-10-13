/**
 * TableTargets.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.queries.TableTargets',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'tinymce.plugins.table.queries.CellOperations'
  ],

  function (Fun, Option, Struct, CellOperations) {
    var noMenu = function (cell) {
      return {
        element: Fun.constant(cell),
        mergable: Option.none,
        unmergable: Option.none,
        selection: Fun.constant([cell])
      };
    };

    var forMenu = function (selections, table, cell) {
      return {
        element: Fun.constant(cell),
        mergable: Fun.constant(CellOperations.mergable(table, selections)),
        unmergable: Fun.constant(CellOperations.unmergable(cell, selections)),
        selection: Fun.constant(CellOperations.selection(cell, selections))
      };
    };

    var notCell = function (element) {
      return noMenu(element);
    };

    var paste = Struct.immutable('element', 'clipboard', 'generators');

    var pasteRows = function (selections, table, cell, clipboard, generators) {
      return {
        element: Fun.constant(cell),
        mergable: Option.none,
        unmergable: Option.none,
        selection: Fun.constant(CellOperations.selection(cell, selections)),
        clipboard: Fun.constant(clipboard),
        generators: Fun.constant(generators)
      };
    };

    return {
      noMenu: noMenu,
      forMenu: forMenu,
      notCell: notCell,
      paste: paste,
      pasteRows: pasteRows
    };
  }
);