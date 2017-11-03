/**
 * MenuItems.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.ui.MenuItems',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.table.actions.InsertTable',
    'tinymce.plugins.table.queries.TableTargets',
    'tinymce.plugins.table.ui.TableDialog'
  ],

  function (Fun, Arr, Option, TableLookup, Element, InsertTable, TableTargets, TableDialog) {
    var addMenuItems = function (editor, selections) {
      var targets = Option.none();

      var tableCtrls = [];
      var cellCtrls = [];
      var mergeCtrls = [];
      var unmergeCtrls = [];

      var noTargetDisable = function (ctrl) {
        ctrl.disabled(true);
      };

      var ctrlEnable = function (ctrl) {
        ctrl.disabled(false);
      };

      var pushTable = function () {
        var self = this;
        tableCtrls.push(self);
        targets.fold(function () {
          noTargetDisable(self);
        }, function (targets) {
          ctrlEnable(self);
        });
      };

      var pushCell = function () {
        var self = this;
        cellCtrls.push(self);
        targets.fold(function () {
          noTargetDisable(self);
        }, function (targets) {
          ctrlEnable(self);
        });
      };

      var pushMerge = function () {
        var self = this;
        mergeCtrls.push(self);
        targets.fold(function () {
          noTargetDisable(self);
        }, function (targets) {
          self.disabled(targets.mergable().isNone());
        });
      };

      var pushUnmerge = function () {
        var self = this;
        unmergeCtrls.push(self);
        targets.fold(function () {
          noTargetDisable(self);
        }, function (targets) {
          self.disabled(targets.unmergable().isNone());
        });
      };

      var setDisabledCtrls = function () {
        targets.fold(function () {
          Arr.each(tableCtrls, noTargetDisable);
          Arr.each(cellCtrls, noTargetDisable);
          Arr.each(mergeCtrls, noTargetDisable);
          Arr.each(unmergeCtrls, noTargetDisable);
        }, function (targets) {
          Arr.each(tableCtrls, ctrlEnable);
          Arr.each(cellCtrls, ctrlEnable);
          Arr.each(mergeCtrls, function (mergeCtrl) {
            mergeCtrl.disabled(targets.mergable().isNone());
          });
          Arr.each(unmergeCtrls, function (unmergeCtrl) {
            unmergeCtrl.disabled(targets.unmergable().isNone());
          });
        });
      };

      editor.on('init', function () {
        editor.on('nodechange', function (e) {
          var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
          targets = cellOpt.bind(function (cellDom) {
            var cell = Element.fromDom(cellDom);
            var table = TableLookup.table(cell);
            return table.map(function (table) {
              return TableTargets.forMenu(selections, table, cell);
            });
          });

          setDisabledCtrls();
        });
      });

      var generateTableGrid = function () {
        var html = '';

        html = '<table role="grid" class="mce-grid mce-grid-border" aria-readonly="true">';

        for (var y = 0; y < 10; y++) {
          html += '<tr>';

          for (var x = 0; x < 10; x++) {
            html += '<td role="gridcell" tabindex="-1"><a id="mcegrid' + (y * 10 + x) + '" href="#" ' +
              'data-mce-x="' + x + '" data-mce-y="' + y + '"></a></td>';
          }

          html += '</tr>';
        }

        html += '</table>';

        html += '<div class="mce-text-center" role="presentation">1 x 1</div>';

        return html;
      };

      var selectGrid = function (editor, tx, ty, control) {
        var table = control.getEl().getElementsByTagName('table')[0];
        var x, y, focusCell, cell, active;
        var rtl = control.isRtl() || control.parent().rel == 'tl-tr';

        table.nextSibling.innerHTML = (tx + 1) + ' x ' + (ty + 1);

        if (rtl) {
          tx = 9 - tx;
        }

        for (y = 0; y < 10; y++) {
          for (x = 0; x < 10; x++) {
            cell = table.rows[y].childNodes[x].firstChild;
            active = (rtl ? x >= tx : x <= tx) && y <= ty;

            editor.dom.toggleClass(cell, 'mce-active', active);

            if (active) {
              focusCell = cell;
            }
          }
        }

        return focusCell.parentNode;
      };

      var insertTable = editor.settings.table_grid === false ? {
        text: 'Table',
        icon: 'table',
        context: 'table',
        onclick: Fun.curry(TableDialog.open, editor)
      } : {
        text: 'Table',
        icon: 'table',
        context: 'table',
        ariaHideMenu: true,
        onclick: function (e) {
          if (e.aria) {
            this.parent().hideAll();
            e.stopImmediatePropagation();
            TableDialog.open(editor);
          }
        },
        onshow: function () {
          selectGrid(editor, 0, 0, this.menu.items()[0]);
        },
        onhide: function () {
          var elements = this.menu.items()[0].getEl().getElementsByTagName('a');
          editor.dom.removeClass(elements, 'mce-active');
          editor.dom.addClass(elements[0], 'mce-active');
        },
        menu: [
          {
            type: 'container',
            html: generateTableGrid(),

            onPostRender: function () {
              this.lastX = this.lastY = 0;
            },

            onmousemove: function (e) {
              var target = e.target, x, y;

              if (target.tagName.toUpperCase() == 'A') {
                x = parseInt(target.getAttribute('data-mce-x'), 10);
                y = parseInt(target.getAttribute('data-mce-y'), 10);

                if (this.isRtl() || this.parent().rel == 'tl-tr') {
                  x = 9 - x;
                }

                if (x !== this.lastX || y !== this.lastY) {
                  selectGrid(editor, x, y, e.control);

                  this.lastX = x;
                  this.lastY = y;
                }
              }
            },

            onclick: function (e) {
              var self = this;

              if (e.target.tagName.toUpperCase() == 'A') {
                e.preventDefault();
                e.stopPropagation();
                self.parent().cancel();

                editor.undoManager.transact(function () {
                  InsertTable.insert(editor, self.lastX + 1, self.lastY + 1);
                });

                editor.addVisual();
              }
            }
          }
        ]
      };

      function cmd(command) {
        return function () {
          editor.execCommand(command);
        };
      }

      var tableProperties = {
        text: 'Table properties',
        context: 'table',
        onPostRender: pushTable,
        onclick: Fun.curry(TableDialog.open, editor, true)
      };

      var deleteTable = {
        text: 'Delete table',
        context: 'table',
        onPostRender: pushTable,
        cmd: 'mceTableDelete'
      };

      var row = {
        text: 'Row',
        context: 'table',
        menu: [
          { text: 'Insert row before', onclick: cmd('mceTableInsertRowBefore'), onPostRender: pushCell },
          { text: 'Insert row after', onclick: cmd('mceTableInsertRowAfter'), onPostRender: pushCell },
          { text: 'Delete row', onclick: cmd('mceTableDeleteRow'), onPostRender: pushCell },
          { text: 'Row properties', onclick: cmd('mceTableRowProps'), onPostRender: pushCell },
          { text: '-' },
          { text: 'Cut row', onclick: cmd('mceTableCutRow'), onPostRender: pushCell },
          { text: 'Copy row', onclick: cmd('mceTableCopyRow'), onPostRender: pushCell },
          { text: 'Paste row before', onclick: cmd('mceTablePasteRowBefore'), onPostRender: pushCell },
          { text: 'Paste row after', onclick: cmd('mceTablePasteRowAfter'), onPostRender: pushCell }
        ]
      };

      var column = {
        text: 'Column',
        context: 'table',
        menu: [
          { text: 'Insert column before', onclick: cmd('mceTableInsertColBefore'), onPostRender: pushCell },
          { text: 'Insert column after', onclick: cmd('mceTableInsertColAfter'), onPostRender: pushCell },
          { text: 'Delete column', onclick: cmd('mceTableDeleteCol'), onPostRender: pushCell }
        ]
      };

      var cell = {
        separator: 'before',
        text: 'Cell',
        context: 'table',
        menu: [
          { text: 'Cell properties', onclick: cmd('mceTableCellProps'), onPostRender: pushCell },
          { text: 'Merge cells', onclick: cmd('mceTableMergeCells'), onPostRender: pushMerge },
          { text: 'Split cell', onclick: cmd('mceTableSplitCells'), onPostRender: pushUnmerge }
        ]
      };

      editor.addMenuItem('inserttable', insertTable);
      editor.addMenuItem('tableprops', tableProperties);
      editor.addMenuItem('deletetable', deleteTable);
      editor.addMenuItem('row', row);
      editor.addMenuItem('column', column);
      editor.addMenuItem('cell', cell);
    };
    return {
      addMenuItems: addMenuItems
    };
  }
);
