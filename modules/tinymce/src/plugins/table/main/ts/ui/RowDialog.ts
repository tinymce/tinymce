/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement, Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import Styles from '../actions/Styles';
import * as Util from '../alien/Util';
import { hasAdvancedRowTab } from '../api/Settings';
import { DomModifier } from './DomModifier';
import Helpers, { RowData } from './Helpers';
import RowDialogGeneralTab from './RowDialogGeneralTab';
import { Types } from '@ephox/bridge';

const switchRowType = (dom: DOMUtils, rowElm: HTMLElement, toType: string) => {
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

const updateAdvancedProps = (modifier: DomModifier, data: RowData): void => {
  modifier.setStyle('background-color', data.backgroundcolor);
  modifier.setStyle('border-color', data.bordercolor);
  modifier.setStyle('border-style', data.borderstyle);
};

const onSubmitRowForm = (editor: Editor, rows: HTMLElement[], oldData: RowData, api) => {
  const dom = editor.dom;

  const data: RowData = api.getData();
  api.close();

  // When selection length is 1, allow things to be turned off/cleared
  const createModifier: (dom, node: Node) => DomModifier = rows.length === 1 ? DomModifier.normal : DomModifier.ifTruthy;

  editor.undoManager.transact(() => {
    Tools.each(rows, (rowElm) => {

      // Switch row type
      if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
        switchRowType(editor.dom, rowElm, data.type);
      }

      const modifier = createModifier(dom, rowElm);

      modifier.setAttrib('scope', data.scope);
      modifier.setAttrib('class', data.class);
      modifier.setStyle('height', Util.addSizeSuffix(data.height));

      if (hasAdvancedRowTab(editor)) {
        updateAdvancedProps(modifier, data);
      }

      if (data.align !== oldData.align) {
        Styles.unApplyAlign(editor, rowElm);
        Styles.applyAlign(editor, rowElm, data.align);
      }
    });
    editor.focus();
  });
};

const open = (editor: Editor) => {
  const dom = editor.dom;
  let tableElm, cellElm, rowElm;
  const rows = [];

  tableElm = dom.getParent(editor.selection.getStart(), 'table');

  if (!tableElm) {
    // If this element is null, return now to avoid crashing.
    return;
  }

  cellElm = dom.getParent(editor.selection.getStart(), 'td,th');

  Tools.each(tableElm.rows, (row) => {
    Tools.each(row.cells, (cell) => {
      if ((dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) && rows.indexOf(row) < 0) {
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

  // Get current data and find shared values between rows
  const rowsData: RowData[] = Tools.map(rows, (rowElm) => Helpers.extractDataFromRowElement(editor, rowElm, hasAdvancedRowTab(editor)));
  const data: RowData = Helpers.getSharedValues(rowsData);

  const dialogTabPanel: Types.Dialog.TabPanelApi = {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: RowDialogGeneralTab.getItems(editor)
      },
      Helpers.getAdvancedTab('row')
    ]
  };
  const dialogPanel: Types.Dialog.PanelApi = {
    type: 'panel',
    items: [
      {
        type: 'grid',
        columns: 2,
        items: RowDialogGeneralTab.getItems(editor)
      }
    ]
  };

  editor.windowManager.open({
    title: 'Row Properties',
    size: 'normal',
    body: hasAdvancedRowTab(editor) ? dialogTabPanel : dialogPanel,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: data,
    onSubmit: Fun.curry(onSubmitRowForm, editor, rows, data),
  });
};

export default {
  open
};
