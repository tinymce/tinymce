/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import * as Styles from '../actions/Styles';
import * as Events from '../api/Events';
import { hasAdvancedRowTab } from '../api/Settings';
import { switchSectionType } from '../core/TableSections';
import * as Util from '../core/Util';
import { ephemera } from '../selection/Ephemera';
import * as TableSelection from '../selection/TableSelection';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';
import * as RowDialogGeneralTab from './RowDialogGeneralTab';

type RowData = Helpers.RowData;

const updateSimpleProps = (modifier: DomModifier, data: RowData) => {
  modifier.setAttrib('class', data.class);
  modifier.setStyle('height', Util.addPxSuffix(data.height));
};

const updateAdvancedProps = (modifier: DomModifier, data: RowData) => {
  modifier.setStyle('background-color', data.backgroundcolor);
  modifier.setStyle('border-color', data.bordercolor);
  modifier.setStyle('border-style', data.borderstyle);
};

const applyRowData = (editor: Editor, rows: HTMLTableRowElement[], oldData: RowData, data: RowData) => {
  const isSingleRow = rows.length === 1;

  const modifiedData = Obj.filter(data, (value, key) => oldData[key] !== value);

  if (Obj.size(modifiedData) > 0) {
    Arr.each(rows, (rowElm) => {
      // Switch row type
      if (data.type !== Util.getNodeName(rowElm.parentNode)) {
        switchSectionType(editor, rowElm, data.type);
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

    const typeModified = Obj.has(modifiedData, 'type');
    // style modified if there's at least one other change apart from 'type'
    const styleModified = typeModified ? Obj.size(modifiedData) > 1 : true;

    TableLookup.table(SugarElement.fromDom(rows[0])).each(
      (table) => Events.fireTableModified(editor, table.dom, {
        structure: typeModified,
        style: styleModified
      })
    );
  }
};

const onSubmitRowForm = (editor: Editor, rows: HTMLTableRowElement[], oldData: RowData, api) => {
  const data: RowData = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyRowData(editor, rows, oldData, data);
    editor.focus();
  });
};

const open = (editor: Editor) => {
  const rows = TableSelection.getRowsFromSelection(Util.getSelectionStart(editor), ephemera.selected);

  // Check if there are any rows to operate on
  if (rows.length === 0) {
    return;
  }

  // Get current data and find shared values between rows
  const rowsData: RowData[] = Arr.map(rows, (rowElm) => Helpers.extractDataFromRowElement(editor, rowElm.dom, hasAdvancedRowTab(editor)));
  const data = Helpers.getSharedValues<RowData>(rowsData);

  const dialogTabPanel: Dialog.TabPanelSpec = {
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
  const dialogPanel: Dialog.PanelSpec = {
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
    onSubmit: Fun.curry(onSubmitRowForm, editor, Arr.map(rows, (r) => r.dom), data)
  });
};

export { open };

