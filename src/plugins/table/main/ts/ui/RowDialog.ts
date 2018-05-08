/**
 * RowDialog.js
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
import { hasAdvancedRowTab, getRowClassList } from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

interface FormData {
  height: string;
  scope: string;
  class: string;
  align: string;
  style: string;
  type: string;
}

const extractDataFromElement = function (editor: Editor, elm: Node): FormData {
  const dom = editor.dom;
  const data: FormData = {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    class: dom.getAttrib(elm, 'class'),
    align: '',
    style: '',
    type: elm.parentNode.nodeName.toLowerCase()
  };

  Tools.each('left center right'.split(' '), function (name: string) {
    if (editor.formatter.matchNode(elm, 'align' + name)) {
      data.align = name;
    }
  });

  if (hasAdvancedRowTab(editor)) {
    Tools.extend(data, Helpers.extractAdvancedStyles(dom, elm));
  }

  return data;
};

const switchRowType = function (dom: DOMUtils, rowElm: HTMLElement, toType) {
  const tableElm = dom.getParent(rowElm, 'table');
  const oldParentElm = rowElm.parentNode;
  let parentElm = dom.select(toType, tableElm as Element)[0];

  if (!parentElm) {
    parentElm = dom.create(toType);
    if (tableElm.firstChild) {
      // caption tag should be the first descendant of the table tag (see TINY-1167)
      if (tableElm.firstChild.nodeName === 'CAPTION') {
        dom.insertAfter(parentElm, tableElm.firstChild);
      } else {
        tableElm.insertBefore(parentElm, tableElm.firstChild);
      }
    } else {
      tableElm.appendChild(parentElm);
    }
  }

  parentElm.appendChild(rowElm);

  if (!oldParentElm.hasChildNodes()) {
    dom.remove(oldParentElm);
  }
};

function onSubmitRowForm(editor: Editor, rows: HTMLElement[], oldData: FormData, evt) {
  const dom = editor.dom;

  function setAttrib(elm: Node, name: string, value: string) {
    if (value) {
      dom.setAttrib(elm, name, value);
    }
  }

  function setStyle(elm: Node, name: string, value: string) {
    if (value) {
      dom.setStyle(elm, name, value);
    }
  }

  Helpers.updateStyleField(editor, evt);
  const data: FormData = evt.control.rootControl.toJSON();

  editor.undoManager.transact(function () {
    Tools.each(rows, function (rowElm: HTMLElement) {
      setAttrib(rowElm, 'scope', data.scope);
      setAttrib(rowElm, 'style', data.style);
      setAttrib(rowElm, 'class', data.class);
      setStyle(rowElm, 'height', Util.addSizeSuffix(data.height));

      if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
        switchRowType(editor.dom, rowElm, data.type);
      }

      if (data.align !== oldData.align) {
        Styles.unApplyAlign(editor, rowElm);
        Styles.applyAlign(editor, rowElm, data.align);
      }
    });

    editor.focus();
  });
}

const open = function (editor: Editor) {
  const dom = editor.dom;
  let tableElm, cellElm, rowElm, classListCtrl, data: FormData;
  const rows = [];
  let generalRowForm;

  tableElm = dom.getParent(editor.selection.getStart(), 'table');
  cellElm = dom.getParent(editor.selection.getStart(), 'td,th');

  Tools.each(tableElm.rows, function (row) {
    Tools.each(row.cells, function (cell) {
      if (dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) {
        rows.push(row);
        return false;
      }
    });
  });

  rowElm = rows[0];
  if (!rowElm) {
    // If this element is null, return now to avoid crashing.
    return;
  }

  if (rows.length > 1) {
    data = {
      height: '',
      scope: '',
      style: '',
      class: '',
      align: '',
      type: rowElm.parentNode.nodeName.toLowerCase()
    };
  } else {
    data = extractDataFromElement(editor, rowElm);
  }

  if (getRowClassList(editor).length > 0) {
    classListCtrl = {
      name: 'class',
      type: 'listbox',
      label: 'Class',
      values: Helpers.buildListItems(
        getRowClassList(editor),
        function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({ block: 'tr', classes: [item.value] });
            };
          }
        }
      )
    };
  }

  generalRowForm = {
    type: 'form',
    columns: 2,
    padding: 0,
    defaults: {
      type: 'textbox'
    },
    items: [
      {
        type: 'listbox',
        name: 'type',
        label: 'Row type',
        text: 'Header',
        maxWidth: null,
        values: [
          { text: 'Header', value: 'thead' },
          { text: 'Body', value: 'tbody' },
          { text: 'Footer', value: 'tfoot' }
        ]
      },
      {
        type: 'listbox',
        name: 'align',
        label: 'Alignment',
        text: 'None',
        maxWidth: null,
        values: [
          { text: 'None', value: '' },
          { text: 'Left', value: 'left' },
          { text: 'Center', value: 'center' },
          { text: 'Right', value: 'right' }
        ]
      },
      { label: 'Height', name: 'height' },
      classListCtrl
    ]
  };

  if (hasAdvancedRowTab(editor)) {
    editor.windowManager.open({
      title: 'Row properties',
      data,
      bodyType: 'tabpanel',
      body: [
        {
          title: 'General',
          type: 'form',
          items: generalRowForm
        },
        Helpers.createStyleForm(editor)
      ],
      onsubmit: Fun.curry(onSubmitRowForm, editor, rows, data)
    });
  } else {
    editor.windowManager.open({
      title: 'Row properties',
      data,
      body: generalRowForm,
      onsubmit: Fun.curry(onSubmitRowForm, editor, rows, data)
    });
  }
};

export default {
  open
};