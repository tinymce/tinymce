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
    'tinymce.core.PluginManager',
    'tinymce.plugins.tablenew.actions.InsertTable'
  ],
  function (PluginManager, InsertTable) {
    function Plugin(editor) {
      function generateTableGrid() {
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
      }

      function selectGrid(tx, ty, control) {
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
      }
      
      editor.addMenuItem('inserttable', {
        text: 'Table',
        icon: 'table',
        context: 'table',
        ariaHideMenu: true,
        onclick: function (e) {
          if (e.aria) {
            this.parent().hideAll();
            e.stopImmediatePropagation();
            dialogs.table();
          }
        },
        onshow: function () {
          selectGrid(0, 0, this.menu.items()[0]);
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
                  selectGrid(x, y, e.control);

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
      });
    }

    PluginManager.add('tablenew', Plugin);

    return function () { };
  }
);
