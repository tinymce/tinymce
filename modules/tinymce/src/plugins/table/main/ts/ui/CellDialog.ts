import { Arr, Fun, Obj, type Optional } from '@ephox/katamari';
import { Adjustments, ResizeBehaviour, TableLookup, TableSize, Warehouse } from '@ephox/snooker';
import { Compare, Dimension, type SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Styles from '../actions/Styles';
import * as Events from '../api/Events';
import * as Options from '../api/Options';
import * as Utils from '../core/Utils';
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

const getTargetPixelWidth = (tableSize: TableSize, width: string): Optional<number> =>
  Dimension.parse(width, [ 'fixed', 'relative', 'empty' ])
    .filter(({ value, unit }) => tableSize.label !== 'none' && unit !== 'pt' && value >= 0)
    .map(({ value, unit }) => unit === '%' ? value / 100 * tableSize.pixelWidth() : value);

const resizeColumns = (table: SugarElement<HTMLTableElement>, selectedCells: SugarElement<HTMLTableCellElement>[], target: number, tableSize: TableSize): boolean => {
  const warehouse = Warehouse.fromTable(table);
  const selectedDetails = Arr.bind(selectedCells, (cell) => Warehouse.findItem(warehouse, cell, Compare.eq).toArray());
  const ranges = Arr.unique(selectedDetails, (a, b) => a.column === b.column && a.colspan === b.colspan);
  const toPixels = (width: number) => tableSize.label === 'percent' ? width / 100 * tableSize.pixelWidth() : width;

  Arr.each(ranges, (range) => {
    const widths = tableSize.getWidths(Warehouse.fromTable(table), tableSize);
    const end = range.column + range.colspan - 1;
    const width = Arr.foldl(widths.slice(range.column, end + 1), (acc, w) => acc + w, 0);
    const delta = target - toPixels(width);
    if (end < widths.length - 1) {
      Adjustments.adjustWidth(table, delta, end, ResizeBehaviour.preserveTable(), tableSize);
    } else if (range.column > 0) {
      Adjustments.adjustWidth(table, -delta, range.column - 1, ResizeBehaviour.preserveTable(), tableSize);
    }
  });

  return ranges.length > 0;
};

const setColumnWidths = (table: SugarElement<HTMLTableElement>, selectedCells: SugarElement<HTMLTableCellElement>[], width: string): boolean => {
  const tableSize = TableSize.getTableSize(table);
  return getTargetPixelWidth(tableSize, width).exists((target) => {
    const isApplied = resizeColumns(table, selectedCells, target, tableSize);
    if (isApplied) {
      Utils.removeDataStyle(table);
    }
    return isApplied;
  });
};

const updateSimpleProps = (modifier: DomModifier, data: CellData, shouldUpdate: (key: string) => boolean): void => {
  if (shouldUpdate('scope')) {
    modifier.setAttrib('scope', data.scope);
  }
  if (shouldUpdate('class') && data.class !== 'mce-no-match') {
    modifier.setAttrib('class', data.class);
  }
};

const updateAdvancedProps = (modifier: DomModifier, data: Required<CellData>, shouldUpdate: (key: string) => boolean): void => {
  if (shouldUpdate('backgroundcolor')) {
    modifier.setFormat('tablecellbackgroundcolor', data.backgroundcolor);
  }
  if (shouldUpdate('bordercolor')) {
    modifier.setFormat('tablecellbordercolor', data.bordercolor);
  }
  if (shouldUpdate('borderstyle')) {
    modifier.setFormat('tablecellborderstyle', data.borderstyle);
  }
  if (shouldUpdate('borderwidth')) {
    modifier.setFormat('tablecellborderwidth', Utils.addPxSuffix(data.borderwidth));
  }
};

const applyStyleData = (editor: Editor, cells: SelectedCell[], data: CellData, wasChanged: (key: string) => boolean, isColumnResized: boolean): void => {
  const isSingleCell = cells.length === 1;
  Arr.each(cells, (item) => {
    const cellElm = item.element;
    const shouldOverrideCurrentValue = isSingleCell ? Fun.always : wasChanged;
    const modifier = DomModifier.normal(editor, cellElm);

    updateSimpleProps(modifier, data, shouldOverrideCurrentValue);

    if (!isColumnResized && shouldOverrideCurrentValue('width')) {
      const colModifier = item.column.map((col) => DomModifier.normal(editor, col)).getOr(modifier);
      colModifier.setStyle('width', Utils.addPxSuffix(data.width));
    }

    if (Options.hasAdvancedCellTab(editor)) {
      updateAdvancedProps(modifier, data as Required<CellData>, shouldOverrideCurrentValue);
    }

    // Apply alignment
    if (wasChanged('halign')) {
      Styles.setAlign(editor, cellElm, data.halign);
    }

    // Apply vertical alignment
    if (wasChanged('valign')) {
      Styles.setVAlign(editor, cellElm, data.valign);
    }
  });
};

const applyStructureData = (editor: Editor, data: CellData): void => {
  // Switch cell type if applicable. Note that we specifically tell the command to not fire events
  // as we'll batch the events and fire a `TableModified` event at the end of the updates.
  editor.execCommand('mceTableCellType', false, { type: data.celltype, no_events: true });
};

const applyCellData = (editor: Editor, cells: SugarElement<HTMLTableCellElement>[], oldData: CellData, data: CellData): void => {
  const modifiedData = Obj.filter(data, (value, key) => oldData[key as keyof CellData] !== value);

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
        const isColumnResized = Obj.has(modifiedData, 'width') && setColumnWidths(table, cells, data.width);
        applyStyleData(editor, selectedCells, data, Fun.curry(Obj.has, modifiedData), isColumnResized);
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
      Helpers.extractDataFromCellElement(editor, item.element, Options.hasAdvancedCellTab(editor), item.column)
    )
  );

  return Helpers.getSharedValues<CellData>(cellsData.getOrDie());
};

const open = (editor: Editor): void => {
  const cells = TableSelection.getCellsFromSelection(editor);

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
    body: Options.hasAdvancedCellTab(editor) ? dialogTabPanel : dialogPanel,
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
