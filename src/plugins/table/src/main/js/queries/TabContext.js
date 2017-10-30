/**
 * TabContext.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.queries.TabContext',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.CellNavigation',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.selection.CursorPosition',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'tinymce.core.util.VK',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.queries.TableTargets'
  ],

  function (Arr, Option, CellNavigation, TableLookup, Compare, Element, Node, SelectorFilter, SelectorFind, CursorPosition, Selection, WindowSelection, VK, Util, TableTargets) {
    var forward = function (editor, isRoot, cell, lazyWire) {
      return go(editor, isRoot, CellNavigation.next(cell), lazyWire);
    };

    var backward = function (editor, isRoot, cell, lazyWire) {
      return go(editor, isRoot, CellNavigation.prev(cell), lazyWire);
    };

    var getCellFirstCursorPosition = function (editor, cell) {
      var selection = Selection.exact(cell, 0, cell, 0);
      return WindowSelection.toNative(selection);
    };

    var getNewRowCursorPosition = function (editor, table) {
      var rows = SelectorFilter.descendants(table, 'tr');
      return Arr.last(rows).bind(function (last) {
        return SelectorFind.descendant(last, 'td,th').map(function (first) {
          return getCellFirstCursorPosition(editor, first);
        });
      });
    };

    var go = function (editor, isRoot, cell, actions, lazyWire) {
      return cell.fold(Option.none, Option.none, function (current, next) {
        return CursorPosition.first(next).map(function (cell) {
          return getCellFirstCursorPosition(editor, cell);
        });
      }, function (current) {
        return TableLookup.table(current, isRoot).bind(function (table) {
          var targets = TableTargets.noMenu(current);
          editor.undoManager.transact(function () {
            actions.insertRowsAfter(table, targets);
          });
          return getNewRowCursorPosition(editor, table);
        });
      });
    };

    var rootElements = ['table', 'li', 'dl'];

    var handle = function (event, editor, actions, lazyWire) {
      if (event.keyCode === VK.TAB) {
        var body = Util.getBody(editor);
        var isRoot = function (element) {
          var name = Node.name(element);
          return Compare.eq(element, body) || Arr.contains(rootElements, name);
        };

        var rng = editor.selection.getRng();
        if (rng.collapsed) {
          var start = Element.fromDom(rng.startContainer);
          TableLookup.cell(start, isRoot).each(function (cell) {
            event.preventDefault();
            var navigation = event.shiftKey ? backward : forward;
            var rng = navigation(editor, isRoot, cell, actions, lazyWire);
            rng.each(function (range) {
              editor.selection.setRng(range);
            });
          });
        }
      }
    };

    return {
      handle: handle
    };
  }
);
