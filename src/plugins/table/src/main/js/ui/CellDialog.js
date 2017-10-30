/**
 * CellDialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.table.ui.CellDialog
 * @private
 */
define(
  'tinymce.plugins.table.ui.CellDialog',
  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.actions.Styles',
    'tinymce.plugins.table.ui.Helpers'
  ],
  function (Tools, Util, Styles, Helpers) {

    var extractDataFromElement = function (editor, elm) {
      var dom = editor.dom;
      var data = {
        width: Util.removePxSuffix(dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width')),
        height: Util.removePxSuffix(dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height')),
        scope: dom.getAttrib(elm, 'scope'),
        'class': dom.getAttrib(elm, 'class')
      };

      data.type = elm.nodeName.toLowerCase();

      Tools.each('left center right'.split(' '), function (name) {
        if (editor.formatter.matchNode(elm, 'align' + name)) {
          data.align = name;
        }
      });

      Tools.each('top middle bottom'.split(' '), function (name) {
        if (editor.formatter.matchNode(elm, 'valign' + name)) {
          data.valign = name;
        }
      });

      if (editor.settings.table_cell_advtab !== false) {
        Tools.extend(data, Helpers.extractAdvancedStyles(dom, elm));
      }

      return data;
    };

    var onSubmitCellForm = function (editor, win, cells) {
      var dom = editor.dom;
      var data;

      function setAttrib(elm, name, value) {
        if (value) {
          dom.setAttrib(elm, name, value);
        }
      }

      function setStyle(elm, name, value) {
        if (value) {
          dom.setStyle(elm, name, value);
        }
      }

      Helpers.updateStyleField(dom, win);
      data = win.toJSON();

      editor.undoManager.transact(function () {
        Tools.each(cells, function (cellElm) {
          setAttrib(cellElm, 'scope', data.scope);
          setAttrib(cellElm, 'style', data.style);
          setAttrib(cellElm, 'class', data['class']);
          setStyle(cellElm, 'width', Util.addSizeSuffix(data.width));
          setStyle(cellElm, 'height', Util.addSizeSuffix(data.height));

          // Switch cell type
          if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
            cellElm = dom.rename(cellElm, data.type);
          }

          // Remove alignment
          if (cells.length === 1) {
            Styles.unApplyAlign(editor, cellElm);
            Styles.unApplyVAlign(editor, cellElm);
          }

          // Apply alignment
          if (data.align) {
            Styles.applyAlign(editor, cellElm, data.align);
          }

          // Apply vertical alignment
          if (data.valign) {
            Styles.applyVAlign(editor, cellElm, data.align);
          }
        });

        editor.focus();
      });
    };

    var open = function (editor) {
      var dom = editor.dom, cellElm, data, classListCtrl, cells = [];

      // Get selected cells or the current cell
      cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
      cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
      if (!cells.length && cellElm) {
        cells.push(cellElm);
      }

      cellElm = cellElm || cells[0];

      if (!cellElm) {
        // If this element is null, return now to avoid crashing.
        return;
      }

      if (cells.length > 1) {
        data = {
          width: '',
          height: '',
          scope: '',
          'class': '',
          align: '',
          style: '',
          type: cellElm.nodeName.toLowerCase()
        };
      } else {
        data = extractDataFromElement(editor, cellElm);
      }

      if (editor.settings.table_cell_class_list) {
        classListCtrl = {
          name: 'class',
          type: 'listbox',
          label: 'Class',
          values: Helpers.buildListItems(
            editor.settings.table_cell_class_list,
            function (item) {
              if (item.value) {
                item.textStyle = function () {
                  return editor.formatter.getCssText({ block: 'td', classes: [item.value] });
                };
              }
            }
          )
        };
      }

      var generalCellForm = {
        type: 'form',
        layout: 'flex',
        direction: 'column',
        labelGapCalc: 'children',
        padding: 0,
        items: [
          {
            type: 'form',
            layout: 'grid',
            columns: 2,
            labelGapCalc: false,
            padding: 0,
            defaults: {
              type: 'textbox',
              maxWidth: 50
            },
            items: [
              { label: 'Width', name: 'width' },
              { label: 'Height', name: 'height' },
              {
                label: 'Cell type',
                name: 'type',
                type: 'listbox',
                text: 'None',
                minWidth: 90,
                maxWidth: null,
                values: [
                  { text: 'Cell', value: 'td' },
                  { text: 'Header cell', value: 'th' }
                ]
              },
              {
                label: 'Scope',
                name: 'scope',
                type: 'listbox',
                text: 'None',
                minWidth: 90,
                maxWidth: null,
                values: [
                  { text: 'None', value: '' },
                  { text: 'Row', value: 'row' },
                  { text: 'Column', value: 'col' },
                  { text: 'Row group', value: 'rowgroup' },
                  { text: 'Column group', value: 'colgroup' }
                ]
              },
              {
                label: 'H Align',
                name: 'align',
                type: 'listbox',
                text: 'None',
                minWidth: 90,
                maxWidth: null,
                values: [
                  { text: 'None', value: '' },
                  { text: 'Left', value: 'left' },
                  { text: 'Center', value: 'center' },
                  { text: 'Right', value: 'right' }
                ]
              },
              {
                label: 'V Align',
                name: 'valign',
                type: 'listbox',
                text: 'None',
                minWidth: 90,
                maxWidth: null,
                values: [
                  { text: 'None', value: '' },
                  { text: 'Top', value: 'top' },
                  { text: 'Middle', value: 'middle' },
                  { text: 'Bottom', value: 'bottom' }
                ]
              }
            ]
          },

          classListCtrl
        ]
      };

      if (editor.settings.table_cell_advtab !== false) {
        editor.windowManager.open({
          title: "Cell properties",
          bodyType: 'tabpanel',
          data: data,
          body: [
            {
              title: 'General',
              type: 'form',
              items: generalCellForm
            },
            Helpers.createStyleForm(dom)
          ],
          onsubmit: function () {
            onSubmitCellForm(editor, this, cells);
          }
        });
      } else {
        editor.windowManager.open({
          title: "Cell properties",
          data: data,
          body: generalCellForm,
          onsubmit: function () {
            onSubmitCellForm(editor, this, cells);
          }
        });
      }
    };

    return {
      open: open
    };

  }
);
