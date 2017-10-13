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
    'ephox.snooker.api.TableRender',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Html'
  ],

  function (TableRender, Attr, Html) {
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

      return tableElm;
    };

    return {
      insert: insert
    };
  }
);
