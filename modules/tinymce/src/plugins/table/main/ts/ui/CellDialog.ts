/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { HTMLTableCellElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Styles from '../actions/Styles';
import { hasAdvancedCellTab } from '../api/Settings';
import * as Util from '../core/Util';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialogGeneralTab from './CellDialogGeneralTab';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';

type CellData = Helpers.CellData;

const updateSimpleProps = (modifier: DomModifier, data: CellData) => {
  modifier.setAttrib('scope', data.scope);
  modifier.setAttrib('class', data.class);
  modifier.setStyle('width', Util.addPxSuffix(data.width));
  modifier.setStyle('height', Util.addPxSuffix(data.height));
};

const updateAdvancedProps = (modifier: DomModifier, data: CellData) => {
  modifier.setFormat('tablecellbackgroundcolor', data.backgroundcolor);
  modifier.setFormat('tablecellbordercolor', data.bordercolor);
  modifier.setFormat('tablecellborderstyle', data.borderstyle);
  modifier.setFormat('tablecellborderwidth', Util.addPxSuffix(data.borderwidth));
};

// NOTES:

// When applying to a single cell, values can be falsy. That is
// because there should be a consistent value across the cell
// selection, so it should also be possible to toggle things off.

// When applying to multiple cells, values must be truthy to be set.
// This is because multiple cells might have different values, and you
// don't want a blank value to wipe out their original values. Note,
// how as part of this, it doesn't remove any original alignment before
// applying any specified alignment.

const applyCellData = (editor: Editor, cells: HTMLTableCellElement[], data: CellData) => {
  const dom = editor.dom;
  const isSingleCell = cells.length === 1;

  Arr.each(cells, (cell) => {
    // Switch cell type if applicable
    const cellElm = data.celltype && Util.getNodeName(cell) !== data.celltype ? (dom.rename(cell, data.celltype) as HTMLTableCellElement) : cell;
    const modifier = isSingleCell ? DomModifier.normal(editor, cellElm) : DomModifier.ifTruthy(editor, cellElm);

    updateSimpleProps(modifier, data);

    if (hasAdvancedCellTab(editor)) {
      updateAdvancedProps(modifier, data);
    }

    // Remove alignment
    if (isSingleCell) {
      Styles.unApplyAlign(editor, cellElm);
      Styles.unApplyVAlign(editor, cellElm);
    }

    // Apply alignment
    if (data.halign) {
      Styles.applyAlign(editor, cellElm, data.halign);
    }

    // Apply vertical alignment
    if (data.valign) {
      Styles.applyVAlign(editor, cellElm, data.valign);
    }
  });
};

const onSubmitCellForm = (editor: Editor, cells: HTMLTableCellElement[], api) => {
  const data: CellData = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyCellData(editor, cells, data);
    editor.focus();
  });
};

const open = (editor: Editor) => {
  const cells = TableSelection.getCellsFromSelection(editor);

  // Check if there are any cells to operate on
  if (cells.length === 0) {
    return;
  }

  // Get current data and find shared values between cells
  const cellsData: CellData[] = Arr.map(cells,
    (cellElm) => Helpers.extractDataFromCellElement(editor, cellElm, hasAdvancedCellTab(editor))
  );
  const data = Helpers.getSharedValues<CellData>(cellsData);

  const dialogTabPanel: Types.Dialog.TabPanelApi = {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: CellDialogGeneralTab.getItems(editor)
      },
      Helpers.getAdvancedTab('cell')
    ]
  };
  const dialogPanel: Types.Dialog.PanelApi = {
    type: 'panel',
    items: [
      {
        type: 'grid',
        columns: 2,
        items: CellDialogGeneralTab.getItems(editor)
      }
    ]
  };
  editor.windowManager.open({
    title: 'Cell Properties',
    size: 'normal',
    body: hasAdvancedCellTab(editor) ? dialogTabPanel : dialogPanel,
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
    onSubmit: Fun.curry(onSubmitCellForm, editor, cells)
  });
};

export {
  open
};
