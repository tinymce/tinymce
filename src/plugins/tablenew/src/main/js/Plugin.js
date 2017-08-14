/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the table plugin.
 *
 * @class tinymce.table.Plugin
 * @private
 */
define(
  'tinymce.plugins.tablenew.Plugin',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.ResizeWire',
    'ephox.snooker.api.TableDirection',
    'ephox.snooker.api.TableFill',
    'ephox.snooker.api.TableLookup',
    'ephox.snooker.api.TableOperations',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Direction',
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.actions.TableWire',
    'tinymce.plugins.tablenew.queries.TableTargets',
    'tinymce.plugins.tablenew.ui.InsertTable'
  ],
  function (Fun, Option, ResizeWire, TableDirection, TableFill, TableLookup, TableOperations, Element, Direction, PluginManager, TableWire, TableTargets, InsertTable) {
    function Plugin(editor) {
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

      editor.addMenuItem('inserttable', InsertTable.insertTableMenuItem(editor));

      var insertRowBefore = execute(TableOperations.insertRowBefore, Fun.noop, lazyWire);

      editor.addMenuItem('row', {
        text: 'Row',
        context: 'table',
        menu: [
          { text: 'Insert row before', onclick: function () {
            var cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
            var table = TableLookup.table(cell);
            var targets = TableTargets.forMenu([], table, cell);
            table.each(function (tab) {
              insertRowBefore(tab, targets);
            });
          }/*, onPostRender: postRenderCell */ }
        ]
      });
    }

    PluginManager.add('tablenew', Plugin);

    return function () { };
  }
);
