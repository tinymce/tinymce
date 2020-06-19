/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { TableSelection } from '@ephox/snooker';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import * as Styles from '../actions/Styles';
import * as Util from '../alien/Util';
import { hasAdvancedRowTab } from '../api/Settings';
import * as Ephemera from '../selection/Ephemera';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';
import * as RowDialogGeneralTab from './RowDialogGeneralTab';

type RowData = Helpers.RowData;

const switchRowType = (dom: DOMUtils, rowElm: HTMLElement, toType: string) => {
  const tableElm = dom.getParent(rowElm, 'table');
  const oldParentElm = rowElm.parentNode;
  let parentElm = dom.select(toType, tableElm)[0];

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

  // If moving from the head to the body, add to the top of the body
  if (toType === 'tbody' && oldParentElm.nodeName === 'THEAD' && parentElm.firstChild) {
    parentElm.insertBefore(rowElm, parentElm.firstChild);
  } else {
    parentElm.appendChild(rowElm);
  }

  if (!oldParentElm.hasChildNodes()) {
    dom.remove(oldParentElm);
  }
};

const updateSimpleProps = (modifier: DomModifier, data: RowData) => {
  modifier.setAttrib('scope', data.scope);
  modifier.setAttrib('class', data.class);
  modifier.setStyle('height', Util.addSizeSuffix(data.height));
};

const updateAdvancedProps = (modifier: DomModifier, data: RowData) => {
  modifier.setStyle('background-color', data.backgroundcolor);
  modifier.setStyle('border-color', data.bordercolor);
  modifier.setStyle('border-style', data.borderstyle);
};

const applyRowData = (editor: Editor, rows: HTMLElement[], oldData: RowData, data: RowData) => {
  const isSingleRow = rows.length === 1;

  Arr.each(rows, (rowElm) => {
    // Switch row type
    if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
      switchRowType(editor.dom, rowElm, data.type);
    }

    const modifier = isSingleRow ? DomModifier.normal(editor, rowElm) : DomModifier.ifTruthy(editor, rowElm);

    updateSimpleProps(modifier, data);

    if (hasAdvancedRowTab(editor)) {
      updateAdvancedProps(modifier, data);
    }

    if (data.align !== oldData.align) {
      Styles.unApplyAlign(editor, rowElm);
      Styles.applyAlign(editor, rowElm, data.align);
    }
  });
};

const onSubmitRowForm = (editor: Editor, rows: HTMLElement[], oldData: RowData, api) => {
  const data: RowData = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyRowData(editor, rows, oldData, data);
    editor.focus();
  });
};

const open = (editor: Editor) => {
  const rows = TableSelection.getRowsFromSelection(Util.getSelectionStart(editor), Ephemera.selected);

  // Check if there are any rows to operate on
  if (rows.length === 0) {
    return;
  }

  // Get current data and find shared values between rows
  const rowsData: RowData[] = Arr.map(rows, (rowElm) => Helpers.extractDataFromRowElement(editor, rowElm.dom(), hasAdvancedRowTab(editor)));
  const data = Helpers.getSharedValues<RowData>(rowsData);

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
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: data,
    onSubmit: Fun.curry(onSubmitRowForm, editor, Arr.map(rows, (r) => r.dom()), data)
  });
};

export { open };

