/**
 * CellOperations.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.queries.CellOperations',

  [
    'ephox.darwin.api.TableSelection',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Attr',
    'tinymce.plugins.table.selection.Ephemera',
    'tinymce.plugins.table.selection.SelectionTypes'
  ],

  function (TableSelection, Arr, Fun, Option, Attr, Ephemera, SelectionTypes) {
    // Return an array of the selected elements
    var selection = function (cell, selections) {
      return SelectionTypes.cata(selections.get(),
        Fun.constant([]),
        Fun.identity,
        Fun.constant([ cell ])
      );
    };

    var unmergable = function (cell, selections) {
      var hasSpan = function (elem) {
        return (Attr.has(elem, 'rowspan') && parseInt(Attr.get(elem, 'rowspan'), 10) > 1) ||
               (Attr.has(elem, 'colspan') && parseInt(Attr.get(elem, 'colspan'), 10) > 1);
      };

      var candidates = selection(cell, selections);

      return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Option.some(candidates) : Option.none();
    };

    var mergable = function (table, selections) {
      return SelectionTypes.cata(selections.get(),
        Option.none,
        function (cells, _env) {
          if (cells.length === 0) {
            return Option.none();
          }
          return TableSelection.retrieveBox(table, Ephemera.firstSelectedSelector(), Ephemera.lastSelectedSelector()).bind(function (bounds) {
            return cells.length > 1 ? Option.some({
              bounds: Fun.constant(bounds),
              cells: Fun.constant(cells)
            }) : Option.none();
          });
        },
        Option.none
      );
    };

    return {
      mergable: mergable,
      unmergable: unmergable,
      selection: selection
    };
  }
);