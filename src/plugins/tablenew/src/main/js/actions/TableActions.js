/**
 * SplitCols.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains logic for handling splitting of merged rows.
 *
 * @class tinymce.table.model.SplitCols
 * @private
 */
define(
  'tinymce.plugins.tablenew.actions.TableActions',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.ResizeWire',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.api.TableOperations',
    'ephox.snooker.api.TableRender',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Direction',
    'ephox.sugar.api.properties.Html',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.queries.TableTargets'
  ],
  function (Fun, Option, ResizeWire, TableDirection, TableFill, TableLookup, TableOperations, TableRender, Element, Attr, Direction, Html, TableWire, TableTargets) {
    return function (editor) {

      var wire = Option.none();

      editor.on('init', function (e) {
        var rawWire = TableWire.get(editor);
        wire = Option.some(rawWire);
      });

      var lazyWire = function () {
        return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
      };

      var ltr = {
        isRtl: Fun.constant(false)
      };

      var rtl = {
        isRtl: Fun.constant(true)
      };

      // Get the directionality from the position in the content
      var directionAt = function (element) {
        var dir = Direction.getDirection(element);
        return dir === 'rtl' ? rtl : ltr;
      };

      var insert = function (editor, rows, columns) {
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

      var execute = function (operation, mutate, lazyWire) {
        return function (table, target) {
          var wire = lazyWire();
          var doc = Element.fromDom(editor.getDoc());
          var direction = TableDirection(directionAt);
          var generators = TableFill.cellOperations(mutate, doc);
          return operation(wire, table, target, generators, direction).map(function (cell) {
            //return Range(cell, 0, cell, 0);
          });
        };
      };

      var actOnSelectedCell = function (execute) {
        var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        var table = TableLookup.table(cell);
        var targets = TableTargets.forMenu([], table, cell);
        table.each(function (tab) {
          execute(tab, targets);
        });
      };

      var insertRowBefore = function () {
        var f = execute(TableOperations.insertRowBefore, Fun.noop, lazyWire);
        actOnSelectedCell(f);
      };

      var insertRowAfter = function () {
        var f = execute(TableOperations.insertRowAfter, Fun.noop, lazyWire);
        actOnSelectedCell(f);
      };

      var insertColumnBefore = function () {
        var f = execute(TableOperations.insertColumnBefore, Fun.noop, lazyWire);
        actOnSelectedCell(f);
      };

      var insertColumnAfter = function () {
        var f = execute(TableOperations.insertColumnAfter, Fun.noop, lazyWire);
        actOnSelectedCell(f);
      };

      return {
        insert: insert,
        insertRowBefore: insertRowBefore,
        insertRowAfter: insertRowAfter,
        insertColumnBefore: insertColumnBefore,
        insertColumnAfter: insertColumnAfter
      };
    };
  }
);
