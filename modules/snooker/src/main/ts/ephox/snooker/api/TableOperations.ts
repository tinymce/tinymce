import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { ContentEditable, Remove, SugarElement, Width } from '@ephox/sugar';

import * as Blocks from '../lookup/Blocks';
import { findCommonCellType, findCommonRowType } from '../lookup/Type';
import * as DetailsList from '../model/DetailsList';
import * as GridRow from '../model/GridRow';
import * as RunOperation from '../model/RunOperation';
import * as TableMerge from '../model/TableMerge';
import * as Transitions from '../model/Transitions';
import * as MergingOperations from '../operate/MergingOperations';
import * as ModificationOperations from '../operate/ModificationOperations';
import * as TransformOperations from '../operate/TransformOperations';
import * as Adjustments from '../resize/Adjustments';
import * as ColUtils from '../util/ColUtils';
import { CompElm } from '../util/TableTypes';
import { Generators, GeneratorsMerging, GeneratorsModification, GeneratorsTransform, SimpleGenerators } from './Generators';
import * as Structs from './Structs';
import * as TableContent from './TableContent';
import * as TableLookup from './TableLookup';
import { TableSection } from './TableSection';
import { Warehouse } from './Warehouse';

export interface TableOperationResult {
  readonly grid: Structs.RowCells[];
  readonly cursor: Optional<SugarElement<HTMLTableCellElement>>;
}

type ExtractMergable = RunOperation.ExtractMergable;
type ExtractPaste = RunOperation.ExtractPaste;
type ExtractPasteRows = RunOperation.ExtractPasteRows;
type TargetSelection = RunOperation.TargetSelection;

interface ExtractColDetail {
  readonly detail: Structs.DetailExt;
  readonly pixelDelta: number;
}

interface ExtractColsDetail {
  readonly details: Structs.DetailExt[];
  readonly pixelDelta: number;
}

// This uses a slight variation to the default `ContentEditable.isEditable` behaviour,
// as when the element is detached we assume it is editable because it is a new cell.
const isEditable = (elem: SugarElement<HTMLElement>) =>
  ContentEditable.isEditable(elem, true);

const prune = (table: SugarElement<HTMLTableElement>) => {
  const cells = TableLookup.cells(table);
  if (cells.length === 0) {
    Remove.remove(table);
  }
};

const outcome = (grid: Structs.RowCells[], cursor: Optional<SugarElement<HTMLTableCellElement>>): TableOperationResult => ({
  grid,
  cursor
});

const findEditableCursorPosition = (rows: Structs.RowCells<HTMLTableRowElement>[]) =>
  Arr.findMap(rows, (row) =>
    Arr.findMap(row.cells, (cell) => {
      const elem = cell.element;
      return Optionals.someIf(isEditable(elem), elem);
    })
  );

const elementFromGrid = (grid: Structs.RowCells[], row: number, column: number) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  return Optional.from(rows[row]?.cells[column]?.element)
    .filter(isEditable)
    // Fallback to the first valid position in the table
    .orThunk(() => findEditableCursorPosition(rows));
};

const bundle = (grid: Structs.RowCells[], row: number, column: number) => {
  const cursorElement = elementFromGrid(grid, row, column);
  return outcome(grid, cursorElement);
};

const uniqueRows = (details: Structs.DetailExt[]) => {
  const rowCompilation = (rest: Structs.DetailExt[], detail: Structs.DetailExt) => {
    const rowExists = Arr.exists(rest, (currentDetail) => currentDetail.row === detail.row);

    return rowExists ? rest : rest.concat([ detail ]);
  };

  return Arr.foldl(details, rowCompilation, []).sort((detailA, detailB) =>
    detailA.row - detailB.row
  );
};

const opInsertRowBefore = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const example = detail.row;
  const targetIndex = detail.row;
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column);
};

const opInsertRowsBefore = (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) => {
  const targetIndex = details[0].row;
  const rows = uniqueRows(details);
  const newGrid = Arr.foldr(rows, (acc, row) => {
    const newG = ModificationOperations.insertRowAt(acc.grid, targetIndex, row.row + acc.delta, comparator, genWrappers.getOrInit);
    return { grid: newG, delta: acc.delta + 1 };
  }, { grid, delta: 0 }).grid;
  return bundle(newGrid, targetIndex, details[0].column);
};

const opInsertRowAfter = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const example = detail.row;
  const targetIndex = detail.row + detail.rowspan;
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column);
};

const opInsertRowsAfter = (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) => {
  const rows = uniqueRows(details);
  const target = rows[rows.length - 1];
  const targetIndex = target.row + target.rowspan;
  const newGrid = Arr.foldr(rows, (newG, row) => {
    return ModificationOperations.insertRowAt(newG, targetIndex, row.row, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, targetIndex, details[0].column);
};

const opInsertColumnBefore = (grid: Structs.RowCells[], extractDetail: ExtractColDetail, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const detail = extractDetail.detail;
  const example = detail.column;
  const targetIndex = detail.column;
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, targetIndex);
};

const opInsertColumnsBefore = (grid: Structs.RowCells[], extractDetail: ExtractColsDetail, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const details = extractDetail.details;
  const columns = ColUtils.uniqueColumns(details);
  const targetIndex = columns[0].column;
  const newGrid = Arr.foldr(columns, (acc, col) => {
    const newG = ModificationOperations.insertColumnAt(acc.grid, targetIndex, col.column + acc.delta, comparator, genWrappers.getOrInit);
    return { grid: newG, delta: acc.delta + 1 };
  }, { grid, delta: 0 }).grid;
  return bundle(newGrid, details[0].row, targetIndex);
};

const opInsertColumnAfter = (grid: Structs.RowCells[], extractDetail: ExtractColDetail, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const detail = extractDetail.detail;
  const example = detail.column;
  const targetIndex = detail.column + detail.colspan;
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, targetIndex);
};

const opInsertColumnsAfter = (grid: Structs.RowCells[], extractDetail: ExtractColsDetail, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const details = extractDetail.details;
  const target = details[details.length - 1];
  const targetIndex = target.column + target.colspan;
  const columns = ColUtils.uniqueColumns(details);
  const newGrid = Arr.foldr(columns, (newG, col) => {
    return ModificationOperations.insertColumnAt(newG, targetIndex, col.column, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, details[0].row, targetIndex);
};

const opMakeColumnHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceColumn(initialGrid, detail.column, true, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opMakeColumnsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const columns = ColUtils.uniqueColumns(details);
  const columnIndexes = Arr.map(columns, (detail) => detail.column);
  const newGrid = TransformOperations.replaceColumns(initialGrid, columnIndexes, true, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, details[0].row, details[0].column);
};

const opMakeCellHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceCell(initialGrid, detail, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opMakeCellsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceCells(initialGrid, details, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, details[0].row, details[0].column);
};

const opUnmakeColumnHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceColumn(initialGrid, detail.column, false, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opUnmakeColumnsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const columns = ColUtils.uniqueColumns(details);
  const columnIndexes = Arr.map(columns, (detail) => detail.column);
  const newGrid = TransformOperations.replaceColumns(initialGrid, columnIndexes, false, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, details[0].row, details[0].column);
};

const opUnmakeCellHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceCell(initialGrid, detail, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opUnmakeCellsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceCells(initialGrid, details, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, details[0].row, details[0].column);
};

const makeRowSection = (section: Structs.Section, applyScope: boolean) =>
  (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform, tableSection: TableSection) => {
    const newGrid = TransformOperations.replaceRow(grid, detail.row, section, applyScope, comparator, genWrappers.replaceOrInit, tableSection);
    return bundle(newGrid, detail.row, detail.column);
  };

const makeRowsSection = (section: Structs.Section, applyScope: boolean) =>
  (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform, tableSection: TableSection) => {
    const rows = uniqueRows(details);
    const rowIndexes = Arr.map(rows, (detail) => detail.row);
    const newGrid = TransformOperations.replaceRows(initialGrid, rowIndexes, section, applyScope, comparator, genWrappers.replaceOrInit, tableSection);
    return bundle(newGrid, details[0].row, details[0].column);
  };

const opMakeRowHeader = makeRowSection('thead', true);
const opMakeRowsHeader = makeRowsSection('thead', true);
const opMakeRowBody = makeRowSection('tbody', false);
const opMakeRowsBody = makeRowsSection('tbody', false);
const opMakeRowFooter = makeRowSection('tfoot', false);
const opMakeRowsFooter = makeRowsSection('tfoot', false);

const opSplitCellIntoColumns = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const newGrid = ModificationOperations.splitCellIntoColumns(grid, detail.row, detail.column, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opSplitCellIntoRows = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const newGrid = ModificationOperations.splitCellIntoRows(grid, detail.row, detail.column, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opEraseColumns = (grid: Structs.RowCells[], extractDetail: ExtractColsDetail, _comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const columns = ColUtils.uniqueColumns(extractDetail.details);

  const newGrid = ModificationOperations.deleteColumnsAt(grid, Arr.map(columns, (column) => column.column));
  const maxColIndex = newGrid.length > 0 ? newGrid[0].cells.length - 1 : 0;
  return bundle(newGrid, columns[0].row, Math.min(columns[0].column, maxColIndex));
};

const opEraseRows = (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = uniqueRows(details);

  const newGrid = ModificationOperations.deleteRowsAt(grid, rows[0].row, rows[rows.length - 1].row);
  const maxRowIndex = newGrid.length > 0 ? newGrid.length - 1 : 0;
  return bundle(newGrid, Math.min(details[0].row, maxRowIndex), details[0].column);
};

const opMergeCells = (grid: Structs.RowCells[], mergable: ExtractMergable, comparator: CompElm, genWrappers: GeneratorsMerging) => {
  const cells = mergable.cells;
  TableContent.merge(cells);

  const newGrid = MergingOperations.merge(grid, mergable.bounds, comparator, genWrappers.merge(cells));

  return outcome(newGrid, Optional.from(cells[0]));
};

const opUnmergeCells = (grid: Structs.RowCells[], unmergable: SugarElement<HTMLTableCellElement>[], comparator: CompElm, genWrappers: GeneratorsMerging) => {
  const unmerge = (b: Structs.RowCells[], cell: SugarElement<HTMLTableCellElement>) =>
    MergingOperations.unmerge(b, cell, comparator, genWrappers.unmerge(cell));

  const newGrid = Arr.foldr(unmergable, unmerge, grid);
  return outcome(newGrid, Optional.from(unmergable[0]));
};

const opPasteCells = (grid: Structs.RowCells[], pasteDetails: ExtractPaste, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const gridify = (table: SugarElement<HTMLTableElement>, generators: SimpleGenerators) => {
    const wh = Warehouse.fromTable(table);
    return Transitions.toGrid(wh, generators, true);
  };
  const gridB = gridify(pasteDetails.clipboard, pasteDetails.generators);
  const startAddress = Structs.address(pasteDetails.row, pasteDetails.column);
  const mergedGrid = TableMerge.merge(startAddress, grid, gridB, pasteDetails.generators, comparator);

  return mergedGrid.fold(
    () => outcome(grid, Optional.some(pasteDetails.element)),
    (newGrid) => {
      return bundle(newGrid, pasteDetails.row, pasteDetails.column);
    }
  );
};

const gridifyRows = (rows: SugarElement<HTMLTableRowElement | HTMLTableColElement>[], generators: Generators, context: Structs.RowCells) => {
  const pasteDetails = DetailsList.fromPastedRows(rows, context.section);
  const wh = Warehouse.generate(pasteDetails);
  return Transitions.toGrid(wh, generators, true);
};

const opPasteColsBefore = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[0].column;
  const context = rows[pasteDetails.cells[0].row];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertCols(index, grid, gridB, pasteDetails.generators, comparator);
  return bundle(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
};

const opPasteColsAfter = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].column + pasteDetails.cells[pasteDetails.cells.length - 1].colspan;
  const context = rows[pasteDetails.cells[0].row];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertCols(index, grid, gridB, pasteDetails.generators, comparator);
  return bundle(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
};

const opPasteRowsBefore = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[0].row;
  const context = rows[index];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators, comparator);
  return bundle(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
};

const opPasteRowsAfter = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].row + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan;
  const context = rows[pasteDetails.cells[0].row];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators, comparator);
  return bundle(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
};

const opGetColumnsType = (table: SugarElement<HTMLTableElement>, target: TargetSelection): string => {
  const house = Warehouse.fromTable(table);
  const details = RunOperation.onCells(house, target);
  return details.bind((selectedCells) => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column;
    const maxColRange = lastSelectedCell.column + lastSelectedCell.colspan;
    const selectedColumnCells = Arr.flatten(Arr.map(house.all, (row) =>
      Arr.filter(row.cells, (cell) => cell.column >= minColRange && cell.column < maxColRange)));
    return findCommonCellType(selectedColumnCells);
  }).getOr('');
};

const opGetCellsType = (table: SugarElement<HTMLTableElement>, target: TargetSelection): string => {
  const house = Warehouse.fromTable(table);
  const details = RunOperation.onCells(house, target);
  return details.bind(findCommonCellType).getOr('');
};

const opGetRowsType = (table: SugarElement<HTMLTableElement>, target: TargetSelection): string => {
  const house = Warehouse.fromTable(table);
  const details = RunOperation.onCells(house, target);
  return details.bind((selectedCells) => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minRowRange = selectedCells[0].row;
    const maxRowRange = lastSelectedCell.row + lastSelectedCell.rowspan;
    const selectedRows = house.all.slice(minRowRange, maxRowRange);
    return findCommonRowType(selectedRows);
  }).getOr('');
};

// Only column modifications force a resizing. Everything else just tries to preserve the table as is.
const resize: RunOperation.Adjustment<{}> = (table, list, details, behaviours) =>
  Adjustments.adjustWidthTo(table, list, details, behaviours.sizing);

const adjustAndRedistributeWidths: RunOperation.Adjustment<{ pixelDelta: number }> = (table, list, details, behaviours) =>
  Adjustments.adjustAndRedistributeWidths(table, list, details, behaviours.sizing, behaviours.resize);

// Custom selection extractors

const firstColumnIsLocked = (_warehouse: Warehouse, details: Structs.DetailExt[]) =>
  Arr.exists(details, (detail) => detail.column === 0 && detail.isLocked);
// TODO: Maybe have an Arr.existsR which would be more efficient for most cases below
const lastColumnIsLocked = (warehouse: Warehouse, details: Structs.DetailExt[]) =>
  Arr.exists(details, (detail) => detail.column + detail.colspan >= warehouse.grid.columns && detail.isLocked);

const getColumnsWidth = (warehouse: Warehouse, details: Structs.DetailExt[]) => {
  const columns = Blocks.columns(warehouse);
  const uniqueCols = ColUtils.uniqueColumns(details);
  return Arr.foldl(uniqueCols, (acc, detail) => {
    const column = columns[detail.column];
    const colWidth = column.map(Width.getOuter).getOr(0);
    return acc + colWidth;
  }, 0);
};

const insertColumnExtractor = (before: boolean) => (warehouse: Warehouse, target: RunOperation.TargetElement): Optional<ExtractColDetail> =>
  RunOperation.onCell(warehouse, target).filter((detail) => {
    const checkLocked = before ? firstColumnIsLocked : lastColumnIsLocked;
    return !checkLocked(warehouse, [ detail ]);
  }).map((detail) => ({
    detail,
    pixelDelta: getColumnsWidth(warehouse, [ detail ]),
  }));

const insertColumnsExtractor = (before: boolean) => (warehouse: Warehouse, target: TargetSelection): Optional<ExtractColsDetail> =>
  RunOperation.onCells(warehouse, target).filter((details) => {
    const checkLocked = before ? firstColumnIsLocked : lastColumnIsLocked;
    return !checkLocked(warehouse, details);
  }).map((details) => ({
    details,
    pixelDelta: getColumnsWidth(warehouse, details),
  }));

const eraseColumnsExtractor = (warehouse: Warehouse, target: TargetSelection): Optional<ExtractColsDetail> =>
  RunOperation.onUnlockedCells(warehouse, target).map((details) => ({
    details,
    pixelDelta: -getColumnsWidth(warehouse, details), // needs to be negative as we are removing columns
  }));

const pasteColumnsExtractor = (before: boolean) => (warehouse: Warehouse, target: RunOperation.TargetPasteRows): Optional<ExtractPasteRows> =>
  RunOperation.onPasteByEditor(warehouse, target).filter((details) => {
    const checkLocked = before ? firstColumnIsLocked : lastColumnIsLocked;
    return !checkLocked(warehouse, details.cells);
  });

const headerCellGenerator = Generators.transform('th');
const bodyCellGenerator = Generators.transform('td');

export const insertRowBefore = RunOperation.run(opInsertRowBefore, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsBefore = RunOperation.run(opInsertRowsBefore, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertRowAfter = RunOperation.run(opInsertRowAfter, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsAfter = RunOperation.run(opInsertRowsAfter, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertColumnBefore = RunOperation.run(opInsertColumnBefore, insertColumnExtractor(true), adjustAndRedistributeWidths, Fun.noop, Generators.modification);
export const insertColumnsBefore = RunOperation.run(opInsertColumnsBefore, insertColumnsExtractor(true), adjustAndRedistributeWidths, Fun.noop, Generators.modification);
export const insertColumnAfter = RunOperation.run(opInsertColumnAfter, insertColumnExtractor(false), adjustAndRedistributeWidths, Fun.noop, Generators.modification);
export const insertColumnsAfter = RunOperation.run(opInsertColumnsAfter, insertColumnsExtractor(false), adjustAndRedistributeWidths, Fun.noop, Generators.modification);
export const splitCellIntoColumns = RunOperation.run(opSplitCellIntoColumns, RunOperation.onUnlockedCell, resize, Fun.noop, Generators.modification);
export const splitCellIntoRows = RunOperation.run(opSplitCellIntoRows, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, Generators.modification);
export const eraseColumns = RunOperation.run(opEraseColumns, eraseColumnsExtractor, adjustAndRedistributeWidths, prune, Generators.modification);
export const eraseRows = RunOperation.run(opEraseRows, RunOperation.onCells, Fun.noop, prune, Generators.modification);
export const makeColumnHeader = RunOperation.run(opMakeColumnHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, headerCellGenerator);
export const makeColumnsHeader = RunOperation.run(opMakeColumnsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, headerCellGenerator);
export const unmakeColumnHeader = RunOperation.run(opUnmakeColumnHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, bodyCellGenerator);
export const unmakeColumnsHeader = RunOperation.run(opUnmakeColumnsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, bodyCellGenerator);
export const makeRowHeader = RunOperation.run(opMakeRowHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, headerCellGenerator);
export const makeRowsHeader = RunOperation.run(opMakeRowsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, headerCellGenerator);
export const makeRowBody = RunOperation.run(opMakeRowBody, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, bodyCellGenerator);
export const makeRowsBody = RunOperation.run(opMakeRowsBody, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, bodyCellGenerator);
export const makeRowFooter = RunOperation.run(opMakeRowFooter, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, bodyCellGenerator);
export const makeRowsFooter = RunOperation.run(opMakeRowsFooter, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, bodyCellGenerator);
export const makeCellHeader = RunOperation.run(opMakeCellHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, headerCellGenerator);
export const makeCellsHeader = RunOperation.run(opMakeCellsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, headerCellGenerator);
export const unmakeCellHeader = RunOperation.run(opUnmakeCellHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, bodyCellGenerator);
export const unmakeCellsHeader = RunOperation.run(opUnmakeCellsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, bodyCellGenerator);
export const mergeCells = RunOperation.run(opMergeCells, RunOperation.onUnlockedMergable, resize, Fun.noop, Generators.merging);
export const unmergeCells = RunOperation.run(opUnmergeCells, RunOperation.onUnlockedUnmergable, resize, Fun.noop, Generators.merging);
export const pasteCells = RunOperation.run(opPasteCells, RunOperation.onPaste, resize, Fun.noop, Generators.modification);
export const pasteColsBefore = RunOperation.run(opPasteColsBefore, pasteColumnsExtractor(true), Fun.noop, Fun.noop, Generators.modification);
export const pasteColsAfter = RunOperation.run(opPasteColsAfter, pasteColumnsExtractor(false), Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsBefore = RunOperation.run(opPasteRowsBefore, RunOperation.onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsAfter = RunOperation.run(opPasteRowsAfter, RunOperation.onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);

export const getColumnsType = opGetColumnsType;
export const getCellsType = opGetCellsType;
export const getRowsType = opGetRowsType;
