/**
 * CellDialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import Styles from '../actions/Styles';
import * as Util from '../alien/Util';
import Helpers from './Helpers';
import { hasAdvancedCellTab, getCellClassList } from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement, Node, HTMLTableCellElement } from '@ephox/dom-globals';

/**
 * @class tinymce.table.ui.CellDialog
 * @private
 */

interface FormData {
  width: string;
  height: string;
  scope: string;
  class: string;
  align: string;
  valign: string;
  style: string;
  type: string;
}

const updateStyles = function (elm: HTMLElement, cssText: string) {
  delete elm.dataset.mceStyle;
  elm.style.cssText += ';' + cssText;
};

const extractDataFromElement = function (editor: Editor, elm: HTMLElement) {
  const dom = editor.dom;
  const data: FormData = {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    class: dom.getAttrib(elm, 'class'),
    type: elm.nodeName.toLowerCase(),
    style: '',
    align: '',
    valign: ''
  };

  Tools.each('left center right'.split(' '), function (name: string) {
    if (editor.formatter.matchNode(elm, 'align' + name)) {
      data.align = name;
    }
  });

  Tools.each('top middle bottom'.split(' '), function (name: string) {
    if (editor.formatter.matchNode(elm, 'valign' + name)) {
      data.valign = name;
    }
  });

  if (hasAdvancedCellTab(editor)) {
    Tools.extend(data, Helpers.extractAdvancedStyles(dom, elm));
  }

  return data;
};

const onSubmitCellForm = function (editor: Editor, cells: Node[], evt) {
  const dom = editor.dom;
  let data: FormData;

  function setAttrib(elm: Node, name: string, value: string) {
    if (cells.length === 1 || value) {
      dom.setAttrib(elm, name, value);
    }
  }

  function setStyle(elm: Node, name: string, value: string) {
    if (cells.length === 1 || value) {
      dom.setStyle(elm, name, value);
    }
  }

  if (hasAdvancedCellTab(editor)) {
    Helpers.syncAdvancedStyleFields(editor, evt);
  }
  data = evt.control.rootControl.toJSON();

  editor.undoManager.transact(function () {
    Tools.each(cells, function (cellElm: HTMLTableCellElement) {
      setAttrib(cellElm, 'scope', data.scope);

      if (cells.length === 1) {
        setAttrib(cellElm, 'style', data.style);
      } else {
        updateStyles(cellElm, data.style);
      }

      setAttrib(cellElm, 'class', data.class);
      setStyle(cellElm, 'width', Util.addSizeSuffix(data.width));
      setStyle(cellElm, 'height', Util.addSizeSuffix(data.height));

      // Switch cell type
      if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
        cellElm = dom.rename(cellElm, data.type) as HTMLTableCellElement;
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
        Styles.applyVAlign(editor, cellElm, data.valign);
      }
    });

    editor.focus();
  });
};

const open = function (editor: Editor) {
  let cellElm, data: FormData, classListCtrl, cells = [];

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
      class: '',
      align: '',
      valign: '',
      style: '',
      type: cellElm.nodeName.toLowerCase()
    };
  } else {
    data = extractDataFromElement(editor, cellElm);
  }

  if (getCellClassList(editor).length > 0) {
    classListCtrl = {
      name: 'class',
      type: 'listbox',
      label: 'Class',
      values: Helpers.buildListItems(
        getCellClassList(editor),
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

  const generalCellForm = {
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
          { label: 'Width', name: 'width', onchange: Fun.curry(Helpers.updateStyleField, editor) },
          { label: 'Height', name: 'height', onchange: Fun.curry(Helpers.updateStyleField, editor) },
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

  if (hasAdvancedCellTab(editor)) {
    editor.windowManager.open({
      title: 'Cell properties',
      bodyType: 'tabpanel',
      data,
      body: [
        {
          title: 'General',
          type: 'form',
          items: generalCellForm
        },
        Helpers.createStyleForm(editor)
      ],
      onsubmit: Fun.curry(onSubmitCellForm, editor, cells)
    });
  } else {
    editor.windowManager.open({
      title: 'Cell properties',
      data,
      body: generalCellForm,
      onsubmit: Fun.curry(onSubmitCellForm, editor, cells)
    });
  }
};

export default {
  open
};