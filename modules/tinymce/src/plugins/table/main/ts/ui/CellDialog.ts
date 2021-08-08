/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { TableLookup, Warehouse } from '@ephox/snooker';
import { Compare, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Styles from '../actions/Styles';
import * as Events from '../api/Events';
import { hasAdvancedCellTab } from '../api/Settings';
import * as Util from '../core/Util';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialogGeneralTab from './CellDialogGeneralTab';
import { getAdvancedTab } from './DialogAdvancedTab';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';

type CellData = Helpers.CellData;

interface SelectedCell {
  readonly element: HTMLTableCellElement;
  readonly column: Optional<HTMLTableColElement>;
}

const getSelectedCells = (table: SugarElement<HTMLTableElement>, cells: SugarElement<HTMLTableCellElement>[]): SelectedCell[] => {
  const warehouse = Warehouse.fromTable(table);
  const allCells = Warehouse.justCells(warehouse);

  const filtered = Arr.filter(allCells, (cellA) =>
    Arr.exists(cells, (cellB) =>
      Compare.eq(cellA.element, cellB)
    )
  );

  return Arr.map(filtered, (cell) => ({
    element: cell.element.dom,
    column: Warehouse.getColumnAt(warehouse, cell.column).map((col) => col.element.dom)
  }));
};

const updateSimpleProps = (modifier: DomModifier, colModifier: DomModifier, data: CellData): void => {
  modifier.setAttrib('scope', data.scope);
  modifier.setAttrib('class', data.class);
  modifier.setStyle('height', Util.addPxSuffix(data.height));
  colModifier.setStyle('width', Util.addPxSuffix(data.width));
};

const updateAdvancedProps = (modifier: DomModifier, data: CellData): void => {
  modifier.setFormat('tablecellbackgroundcolor', data.backgroundcolor);
  modifier.setFormat('tablecellbordercolor', data.bordercolor);
  modifier.setFormat('tablecellborderstyle', data.borderstyle);
  modifier.setFormat('tablecellborderwidth', Util.addPxSuffix(data.borderwidth));
};

/*
  NOTES:

  When applying to a single cell, values can be falsy. That is
  because there should be a consistent value across the cell
  selection, so it should also be possible to toggle things off.

  When applying to multiple cells, values must be truthy to be set.
  This is because multiple cells might have different values, and you
  don't want a blank value to wipe out their original values. Note,
  how as part of this, it doesn't remove any original alignment before
  applying any specified alignment.
 */
const applyStyleData = (editor: Editor, cells: SelectedCell[], data: CellData): void => {
  const isSingleCell = cells.length === 1;
  Arr.each(cells, (item) => {
    const cellElm = item.element;
    const modifier = isSingleCell ? DomModifier.normal(editor, cellElm) : DomModifier.ifTruthy(editor, cellElm);
    const colModifier = item.column.map((col) =>
      isSingleCell ? DomModifier.normal(editor, col) : DomModifier.ifTruthy(editor, col)
    ).getOr(modifier);

    updateSimpleProps(modifier, colModifier, data);

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

const applyStructureData = (editor: Editor, data: CellData): void => {
  // Switch cell type if applicable. Note that we specifically tell the command to not fire events
  // as we'll batch the events and fire a `TableModified` event at the end of the updates.
  editor.execCommand('mceTableCellType', false, { type: data.celltype, no_events: true });
};

const applyCellData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, data: CellData): void => {
  const modifiedData = Obj.filter(data, (value, key) => oldData[key] !== value);

  if (Obj.size(modifiedData) > 0 && cells.length >= 1) {
    // Retrieve the table before the cells are modified as there is a case where cells
    // are replaced and the reference will be lost when trying to fire events.
    TableLookup.table(cells[0]).each((table) => {
      const selectedCells = getSelectedCells(table, cells);

      // style modified if there's at least one other change apart from 'celltype' and 'scope'
      const styleModified = Obj.size(Obj.filter(modifiedData, (_value, key) => key !== 'scope' && key !== 'celltype')) > 0;
      const structureModified = Obj.has(modifiedData, 'celltype');

      // Update the cells styling using the dialog data
      if (styleModified || Obj.has(modifiedData, 'scope')) {
        applyStyleData(editor, selectedCells, data);
      }

      // Update the cells structure using the dialog data
      if (structureModified) {
        applyStructureData(editor, data);
      }

      Events.fireTableModified(editor, table.dom, {
        structure: structureModified,
        style: styleModified,
      });
    });
  }
};

const onSubmitCellForm = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, api: Dialog.DialogInstanceApi<CellData>): void => {
  const data = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyCellData(editor, cells, oldData, data);
    editor.focus();
  });
};

const getData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[]): CellData => {
  const cellsData = TableLookup.table(cells[0]).map((table) =>
    Arr.map(getSelectedCells(table, cells), (item) =>
      Helpers.extractDataFromCellElement(editor, item.element, hasAdvancedCellTab(editor), item.column)
    )
  );

  return Helpers.getSharedValues<CellData>(cellsData.getOrDie());
};

const open = (editor: Editor, selections: Selections): void => {
  const cells = TableSelection.getCellsFromSelection(selections);

  // Check if there are any cells to operate on
  if (cells.length === 0) {
    return;
  }

  const data = getData(editor, cells);

  const dialogTabPanel: Dialog.TabPanelSpec = {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: CellDialogGeneralTab.getItems(editor)
      },
      getAdvancedTab(editor, 'cell')
    ]
  };
  const dialogPanel: Dialog.PanelSpec = {
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
    onSubmit: Fun.curry(onSubmitCellForm, editor, cells, data)
  });
};

export { open };
