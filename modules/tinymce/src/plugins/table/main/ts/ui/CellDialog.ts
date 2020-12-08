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
import { switchCellType } from '../core/TableSections';
import * as Util from '../core/Util';
import * as TableSelection from '../selection/TableSelection';
import * as CellDialogGeneralTab from './CellDialogGeneralTab';
import { DomModifier } from './DomModifier';
import * as Helpers from './Helpers';

type CellData = Helpers.CellData;
interface SelectedCell {
  element: HTMLTableCellElement;
  column: Optional<HTMLTableColElement>;
}

const getSelectedCells = (cells: SugarElement<HTMLTableCellElement>[]): Optional<SelectedCell[]> =>
  TableLookup.table(cells[0]).map((table) => {
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
  });

const updateSimpleProps = (modifier: DomModifier, colModifier: DomModifier, data: CellData) => {
  modifier.setAttrib('scope', data.scope);
  modifier.setAttrib('class', data.class);
  modifier.setStyle('height', Util.addPxSuffix(data.height));
  colModifier.setStyle('width', Util.addPxSuffix(data.width));
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

const applyCellData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, data: CellData) => {
  const isSingleCell = cells.length === 1;

  const modifiedData = Obj.filter(data, (value, key) => oldData[key] !== value);

  if (Obj.size(modifiedData) > 0 && cells.length >= 1) {
    /*
      Retrieve the table before the cells are modified
      as there is a case where cells are replaced and
      the reference will be lost when trying to fire events.
    */
    const tableOpt = TableLookup.table(cells[0]);

    getSelectedCells(cells).each((selectedCells) => {
      Arr.each(selectedCells, (item) => {
        // Switch cell type if applicable
        const cellElm = switchCellType(editor, item.element, data.celltype);
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
    });

    // style modified if there's at least one other change apart from 'celltype' and 'scope'
    const styleModified = Obj.size(Obj.filter(modifiedData, (_value, key) => key !== 'scope' && key !== 'celltype')) > 0;

    tableOpt.each(
      (table) => Events.fireTableModified(editor, table.dom, {
        structure: Obj.has(modifiedData, 'celltype'),
        style: styleModified,
      })
    );
  }
};

const onSubmitCellForm = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, api) => {
  const data: CellData = api.getData();
  api.close();

  editor.undoManager.transact(() => {
    applyCellData(editor, cells, oldData, data);
    editor.focus();
  });
};

const getData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[]) => {
  const cellsData = getSelectedCells(cells).map((selectedCells) =>
    Arr.map(selectedCells, (item) =>
      Helpers.extractDataFromCellElement(editor, item.element, hasAdvancedCellTab(editor), item.column)
    )
  );

  return Helpers.getSharedValues<CellData>(cellsData.getOrDie());
};

const open = (editor: Editor, selections: Selections) => {
  const cells = TableSelection.getCellsFromSelection(Util.getSelectionStart(editor), selections);

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
      Helpers.getAdvancedTab('cell')
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
