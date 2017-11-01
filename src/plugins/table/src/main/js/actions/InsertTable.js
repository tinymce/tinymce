/**
 * InsertTable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.actions.InsertTable',

  [
    'ephox.katamari.api.Fun',
    'ephox.snooker.api.TableRender',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Fun, TableRender, Element, Attr, Html, SelectorFind) {
    var placeCaretInCell = function (editor, cell) {
      editor.selection.select(cell.dom(), true);
      editor.selection.collapse(true);
    };

    var selectFirstCellInTable = function (editor, tableElm) {
      SelectorFind.descendant(tableElm, 'td,th').each(Fun.curry(placeCaretInCell, editor));
    };

    var insert = function (editor, columns, rows) {
      var tableElm;

      var renderedHtml = TableRender.render(rows, columns, 0, 0);

      Attr.set(renderedHtml, 'id', '__mce');

      var html = Html.getOuter(renderedHtml);

      editor.insertContent(html);

      tableElm = editor.dom.get('__mce');
      editor.dom.setAttrib(tableElm, 'id', null);

      editor.$('tr', tableElm).each(function (index, row) {
        editor.fire('newrow', {
          node: row
        });

        editor.$('th,td', row).each(function (index, cell) {
          editor.fire('newcell', {
            node: cell
          });
        });
      });

      editor.dom.setAttribs(tableElm, editor.settings.table_default_attributes || {});
      editor.dom.setStyles(tableElm, editor.settings.table_default_styles || {});

      selectFirstCellInTable(editor, Element.fromDom(tableElm));

      return tableElm;
    };

    return {
      insert: insert
    };
  }
);
