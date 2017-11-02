/**
 * TableDialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.table.ui.TableDialog
 * @private
 */
define(
  'tinymce.plugins.table.ui.TableDialog',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.Env',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.actions.Styles',
    'tinymce.plugins.table.actions.InsertTable',
    'tinymce.plugins.table.ui.Helpers'
  ],
  function (Tools, Env, Util, Styles, InsertTable, Helpers) {

    //Explore the layers of the table till we find the first layer of tds or ths
    function styleTDTH(dom, elm, name, value) {
      if (elm.tagName === "TD" || elm.tagName === "TH") {
        dom.setStyle(elm, name, value);
      } else {
        if (elm.children) {
          for (var i = 0; i < elm.children.length; i++) {
            styleTDTH(dom, elm.children[i], name, value);
          }
        }
      }
    }

    var extractDataFromElement = function (editor, tableElm) {
      var dom = editor.dom;
      var data = {
        width: Util.removePxSuffix(dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width')),
        height: Util.removePxSuffix(dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height')),
        cellspacing: Util.removePxSuffix(dom.getStyle(tableElm, 'border-spacing') || dom.getAttrib(tableElm, 'cellspacing')),
        cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') || Styles.getTDTHOverallStyle(editor.dom, tableElm, 'padding'),
        border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') || Styles.getTDTHOverallStyle(editor.dom, tableElm, 'border'),
        borderColor: dom.getAttrib(tableElm, 'data-mce-border-color'),
        caption: !!dom.select('caption', tableElm)[0],
        'class': dom.getAttrib(tableElm, 'class')
      };

      Tools.each('left center right'.split(' '), function (name) {
        if (editor.formatter.matchNode(tableElm, 'align' + name)) {
          data.align = name;
        }
      });

      if (editor.settings.table_advtab !== false) {
        Tools.extend(data, Helpers.extractAdvancedStyles(dom, tableElm));
      }
      return data;
    };

    var applyDataToElement = function (editor, tableElm, data) {
      var dom = editor.dom;
      var attrs = {}, styles = {};

      attrs['class'] = data['class'];

      styles.height = Util.addSizeSuffix(data.height);

      if (dom.getAttrib(tableElm, 'width') && !editor.settings.table_style_by_css) {
        attrs.width = Util.removePxSuffix(data.width);
      } else {
        styles.width = Util.addSizeSuffix(data.width);
      }

      if (editor.settings.table_style_by_css) {
        styles['border-width'] = Util.addSizeSuffix(data.border);
        styles['border-spacing'] = Util.addSizeSuffix(data.cellspacing);

        Tools.extend(attrs, {
          'data-mce-border-color': data.borderColor,
          'data-mce-cell-padding': data.cellpadding,
          'data-mce-border': data.border
        });
      } else {
        Tools.extend(attrs, {
          border: data.border,
          cellpadding: data.cellpadding,
          cellspacing: data.cellspacing
        });
      }

      // TODO: this has to be reworked somehow, for example by introducing dedicated option, which
      // will control whether child TD/THs should be processed or not
      if (editor.settings.table_style_by_css) {
        if (tableElm.children) {
          for (var i = 0; i < tableElm.children.length; i++) {
            styleTDTH(dom, tableElm.children[i], {
              'border-width': Util.addSizeSuffix(data.border),
              'border-color': data.borderColor,
              'padding': Util.addSizeSuffix(data.cellpadding)
            });
          }
        }
      }

      if (data.style) {
        // merge the styles from Advanced tab on top
        Tools.extend(styles, dom.parseStyle(data.style));
      } else {
        // ... otherwise take styles from original elm and update them
        styles = Tools.extend({}, dom.parseStyle(dom.getAttrib(tableElm, 'style')), styles);
      }

      attrs.style = dom.serializeStyle(styles);

      dom.setAttribs(tableElm, attrs);
    };

    var onSubmitTableForm = function (editor, win, tableElm) {
      var dom = editor.dom;
      var captionElm;
      var data;

      Helpers.updateStyleField(dom, win);
      data = win.toJSON();

      if (data["class"] === false) {
        delete data["class"];
      }

      editor.undoManager.transact(function () {
        if (!tableElm) {
          tableElm = InsertTable.insert(editor, data.cols || 1, data.rows || 1);
        }

        applyDataToElement(editor, tableElm, data);

        // Toggle caption on/off
        captionElm = dom.select('caption', tableElm)[0];

        if (captionElm && !data.caption) {
          dom.remove(captionElm);
        }

        if (!captionElm && data.caption) {
          captionElm = dom.create('caption');
          captionElm.innerHTML = !Env.ie ? '<br data-mce-bogus="1"/>' : '\u00a0';
          tableElm.insertBefore(captionElm, tableElm.firstChild);
        }

        Styles.unApplyAlign(editor, tableElm);
        if (data.align) {
          Styles.applyAlign(editor, tableElm, data.align);
        }

        editor.focus();
        editor.addVisual();
      });
    };

    var open = function (editor, isProps) {
      var dom = editor.dom, tableElm, colsCtrl, rowsCtrl, classListCtrl, data = {}, generalTableForm;

      if (isProps === true) {
        tableElm = dom.getParent(editor.selection.getStart(), 'table');
        if (tableElm) {
          data = extractDataFromElement(editor, tableElm);
        }
      } else {
        colsCtrl = { label: 'Cols', name: 'cols' };
        rowsCtrl = { label: 'Rows', name: 'rows' };
      }

      if (editor.settings.table_class_list) {
        if (data["class"]) {
          data["class"] = data["class"].replace(/\s*mce\-item\-table\s*/g, '');
        }

        classListCtrl = {
          name: 'class',
          type: 'listbox',
          label: 'Class',
          values: Helpers.buildListItems(
            editor.settings.table_class_list,
            function (item) {
              if (item.value) {
                item.textStyle = function () {
                  return editor.formatter.getCssText({ block: 'table', classes: [item.value] });
                };
              }
            }
          )
        };
      }

      generalTableForm = {
        type: 'form',
        layout: 'flex',
        direction: 'column',
        labelGapCalc: 'children',
        padding: 0,
        items: [
          {
            type: 'form',
            labelGapCalc: false,
            padding: 0,
            layout: 'grid',
            columns: 2,
            defaults: {
              type: 'textbox',
              maxWidth: 50
            },
            items: (editor.settings.table_appearance_options !== false) ? [
              colsCtrl,
              rowsCtrl,
              { label: 'Width', name: 'width' },
              { label: 'Height', name: 'height' },
              { label: 'Cell spacing', name: 'cellspacing' },
              { label: 'Cell padding', name: 'cellpadding' },
              { label: 'Border', name: 'border' },
              { label: 'Caption', name: 'caption', type: 'checkbox' }
            ] : [
              colsCtrl,
              rowsCtrl,
                { label: 'Width', name: 'width' },
                { label: 'Height', name: 'height' }
            ]
          },

          {
            label: 'Alignment',
            name: 'align',
            type: 'listbox',
            text: 'None',
            values: [
              { text: 'None', value: '' },
              { text: 'Left', value: 'left' },
              { text: 'Center', value: 'center' },
              { text: 'Right', value: 'right' }
            ]
          },

          classListCtrl
        ]
      };

      if (editor.settings.table_advtab !== false) {
        editor.windowManager.open({
          title: "Table properties",
          data: data,
          bodyType: 'tabpanel',
          body: [
            {
              title: 'General',
              type: 'form',
              items: generalTableForm
            },
            Helpers.createStyleForm(dom)
          ],
          onsubmit: function () {
            onSubmitTableForm(editor, this, tableElm);
          }
        });
      } else {
        editor.windowManager.open({
          title: "Table properties",
          data: data,
          body: generalTableForm,
          onsubmit: function () {
            onSubmitTableForm(editor, this, tableElm);
          }
        });
      }
    };

    return {
      open: open
    };

  }
);
