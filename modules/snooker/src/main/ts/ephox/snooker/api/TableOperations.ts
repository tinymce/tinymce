import { Arr, Fun, Optional } from '@ephox/katamari';
import { Remove, SugarElement, SugarNode } from '@ephox/sugar';
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
import { Generators, GeneratorsMerging, GeneratorsModification, GeneratorsTransform, SimpleGenerators } from './Generators';
import * as Structs from './Structs';
import * as TableContent from './TableContent';
import * as TableLookup from './TableLookup';
import { Warehouse } from './Warehouse';

export interface TableOperationResult {
  readonly grid: Structs.RowCells[];
  readonly cursor: Optional<SugarElement>;
}

type ExtractMergable = RunOperation.ExtractMergable;
type ExtractPaste = RunOperation.ExtractPaste;
type ExtractPasteRows = RunOperation.ExtractPasteRows;
type TargetSelection = RunOperation.TargetSelection;

type CompElm = (e1: SugarElement, e2: SugarElement) => boolean;

const prune = (table: SugarElement) => {
  const cells = TableLookup.cells(table);
  if (cells.length === 0) {
    Remove.remove(table);
  }
};

const outcome = (grid: Structs.RowCells[], cursor: Optional<SugarElement>): TableOperationResult => ({
  grid,
  cursor
});

const elementFromGrid = (grid: Structs.RowCells[], row: number, column: number) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  return findIn(rows, row, column).orThunk(() =>
    findIn(rows, 0, 0)
  );
};

const findIn = (grid: Structs.RowCells[], row: number, column: number) =>
  Optional.from(grid[row]).bind((r) =>
    Optional.from(r.cells[column]).bind((c) =>
      Optional.from(c.element)
    )
  );

const bundle = (grid: Structs.RowCells[], row: number, column: number) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  return outcome(grid, findIn(rows, row, column));
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
  const example = details[0].row;
  const targetIndex = details[0].row;
  const rows = uniqueRows(details);
  const newGrid = Arr.foldl(rows, (newG, _row) => ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit), grid);
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
  const example = rows[rows.length - 1].row;
  const targetIndex = rows[rows.length - 1].row + rows[rows.length - 1].rowspan;
  const newGrid = Arr.foldl(rows, (newG, _row) => ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit), grid);
  return bundle(newGrid, targetIndex, details[0].column);
};

const opInsertColumnBefore = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const example = detail.column;
  const targetIndex = detail.column;
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, targetIndex);
};

const opInsertColumnsBefore = (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) => {
  const columns = ColUtils.uniqueColumns(details);
  const target = columns[0];
  const example = target.column;
  const targetIndex = target.column;
  const newGrid = Arr.foldl(columns, (newG, _row) => ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit), grid);
  return bundle(newGrid, details[0].row, targetIndex);
};

const opInsertColumnAfter = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const example = detail.column;
  const targetIndex = detail.column + detail.colspan;
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, targetIndex);
};

const opInsertColumnsAfter = (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) => {
  const target = details[details.length - 1];
  const example = target.column;
  const targetIndex = target.column + target.colspan;
  const columns = ColUtils.uniqueColumns(details);
  const newGrid = Arr.foldl(columns, (newG, _row) => ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit), grid);
  return bundle(newGrid, details[0].row, targetIndex);
};

const opMakeRowHeader = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceRow(grid, detail.row, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opMakeRowsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const rows = uniqueRows(details);

  const replacer = (currentGrid: Structs.RowCells[], row: Structs.DetailExt) => TransformOperations.replaceRow(currentGrid, row.row, comparator, genWrappers.replaceOrInit);

  const newGrid = Arr.foldl(rows, replacer, initialGrid);

  return bundle(newGrid, details[0].row, details[0].column);
};

const opMakeColumnHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceColumn(initialGrid, detail.column, comparator, genWrappers.replaceOrInit);

  return bundle(newGrid, detail.row, detail.column);
};

const opMakeColumnsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const columns = ColUtils.uniqueColumns(details);

  const replacer = (currentGrid: Structs.RowCells[], column: Structs.DetailExt) => TransformOperations.replaceColumn(currentGrid, column.column, comparator, genWrappers.replaceOrInit);

  const newGrid = Arr.foldl(columns, replacer, initialGrid);

  return bundle(newGrid, details[0].row, details[0].column);
};

const opUnmakeRowHeader = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceRow(grid, detail.row, comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opUnmakeRowsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const rows = uniqueRows(details);

  const replacer = (currentGrid: Structs.RowCells[], row: Structs.DetailExt) => TransformOperations.replaceRow(currentGrid, row.row, comparator, genWrappers.replaceOrInit);

  const newGrid = Arr.foldl(rows, replacer, initialGrid);

  return bundle(newGrid, details[0].row, details[0].column);
};

const opUnmakeColumnHeader = (initialGrid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const newGrid = TransformOperations.replaceColumn(initialGrid, detail.column, comparator, genWrappers.replaceOrInit);

  return bundle(newGrid, detail.row, detail.column);
};

const opUnmakeColumnsHeader = (initialGrid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsTransform) => {
  const columns = ColUtils.uniqueColumns(details);

  const replacer = (currentGrid: Structs.RowCells[], column: Structs.DetailExt) => TransformOperations.replaceColumn(currentGrid, column.column, comparator, genWrappers.replaceOrInit);

  const newGrid = Arr.foldl(columns, replacer, initialGrid);

  return bundle(newGrid, details[0].row, details[0].column);
};

const opSplitCellIntoColumns = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const newGrid = ModificationOperations.splitCellIntoColumns(grid, detail.row, detail.column, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opSplitCellIntoRows = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) => {
  const newGrid = ModificationOperations.splitCellIntoRows(grid, detail.row, detail.column, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row, detail.column);
};

const opEraseColumns = (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const columns = ColUtils.uniqueColumns(details);
  const columnNums = Arr.map(columns, (column) => column.column);

  const newGrid = ModificationOperations.deleteColumnsAt(grid, columnNums);
  const cursor = elementFromGrid(newGrid, columns[0].row, columns[0].column);
  return outcome(newGrid, cursor);
};

const opEraseRows = (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = uniqueRows(details);

  const newGrid = ModificationOperations.deleteRowsAt(grid, rows[0].row, rows[rows.length - 1].row);
  const cursor = elementFromGrid(newGrid, details[0].row, details[0].column);
  return outcome(newGrid, cursor);
};

const opMergeCells = (grid: Structs.RowCells[], mergable: ExtractMergable, comparator: CompElm, genWrappers: GeneratorsMerging) => {
  const cells = mergable.cells;
  TableContent.merge(cells);

  const newGrid = MergingOperations.merge(grid, mergable.bounds, comparator, genWrappers.merge(cells));

  return outcome(newGrid, Optional.from(cells[0]));
};

const opUnmergeCells = (grid: Structs.RowCells[], unmergable: SugarElement[], comparator: CompElm, genWrappers: GeneratorsMerging) => {
  const unmerge = (b: Structs.RowCells[], cell: SugarElement) =>
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
      const cursor = elementFromGrid(newGrid, pasteDetails.row, pasteDetails.column);
      return outcome(newGrid, cursor);
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
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
  return outcome(mergedGrid, cursor);
};

const opPasteColsAfter = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].column + pasteDetails.cells[pasteDetails.cells.length - 1].colspan;
  const context = rows[pasteDetails.cells[0].row];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertCols(index, grid, gridB, pasteDetails.generators, comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
  return outcome(mergedGrid, cursor);
};

const opPasteRowsBefore = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[0].row;
  const context = rows[index];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators, comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
  return outcome(mergedGrid, cursor);
};

const opPasteRowsAfter = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].row + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan;
  const context = rows[pasteDetails.cells[0].row];
  const gridB = gridifyRows(pasteDetails.clipboard, pasteDetails.generators, context);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators, comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row, pasteDetails.cells[0].column);
  return outcome(mergedGrid, cursor);
};

const opGetColumnType = (table: SugarElement, target: TargetSelection): string => {
  const house = Warehouse.fromTable(table);
  const details = RunOperation.onCells(house, target);
  return details.bind((selectedCells): Optional<string> => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column;
    const maxColRange = lastSelectedCell.column + lastSelectedCell.colspan;
    const selectedColumnCells = Arr.flatten(Arr.map(house.all, (row) =>
      Arr.filter(row.cells, (cell) => cell.column >= minColRange && cell.column < maxColRange)));
    return getCellsType(selectedColumnCells, (cell) => SugarNode.name(cell.element) === 'th');
  }).getOr('');
};

export const getCellsType = <T>(cells: T[], headerPred: (x: T) => boolean): Optional<string> => {
  const headerCells = Arr.filter(cells, headerPred);
  if (headerCells.length === 0) {
    return Optional.some('td');
  } else if (headerCells.length === cells.length) {
    return Optional.some('th');
  } else {
    return Optional.none();
  }
};

// Only column modifications force a resizing. Everything else just tries to preserve the table as is.
const resize = Adjustments.adjustWidthTo;

// Custom selection extractors

const firstLastLocked = (before: boolean, warehouse: Warehouse, details: Structs.DetailExt[]) => {
  if (before) {
    return Arr.exists(details, (detail) => detail.column === 0 && detail.isLocked);
  } else {
    const width = warehouse.grid.columns;
    return Arr.exists(details, (detail) => detail.column + detail.colspan === width && detail.isLocked);
  }
};

const insertColumnExtractor = (before: boolean) => (warehouse: Warehouse, target: RunOperation.TargetElement): Optional<Structs.DetailExt> =>
  RunOperation.onCell(warehouse, target).filter((detail) => !firstLastLocked(before, warehouse, [ detail ]));

// Not filtering out locked columns as that creates a contradiction where the locked column at the start or end of the selection is included in the count.
// Could try and do further filtering in the operations but that doesn't seem worth it
const insertColumnsExtractor = (before: boolean) => (warehouse: Warehouse, target: TargetSelection): Optional<Structs.DetailExt[]> =>
  RunOperation.onCells(warehouse, target).filter((details) => !firstLastLocked(before, warehouse, details));

const pasteColumnsExtractor = (before: boolean) => (warehouse: Warehouse, target: RunOperation.TargetPasteRows): Optional<ExtractPasteRows> =>
  RunOperation.onPasteByEditor(warehouse, target).filter((details) => !firstLastLocked(before, warehouse, details.cells));

export const insertRowBefore = RunOperation.run(opInsertRowBefore, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsBefore = RunOperation.run(opInsertRowsBefore, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertRowAfter = RunOperation.run(opInsertRowAfter, RunOperation.onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsAfter = RunOperation.run(opInsertRowsAfter, RunOperation.onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertColumnBefore = RunOperation.run(opInsertColumnBefore, insertColumnExtractor(true), resize, Fun.noop, Generators.modification);
export const insertColumnsBefore = RunOperation.run(opInsertColumnsBefore, insertColumnsExtractor(true), resize, Fun.noop, Generators.modification);
export const insertColumnAfter = RunOperation.run(opInsertColumnAfter, insertColumnExtractor(false), resize, Fun.noop, Generators.modification);
export const insertColumnsAfter = RunOperation.run(opInsertColumnsAfter, insertColumnsExtractor(false), resize, Fun.noop, Generators.modification);
export const splitCellIntoColumns = RunOperation.run(opSplitCellIntoColumns, RunOperation.onUnlockedCell, resize, Fun.noop, Generators.modification);
export const splitCellIntoRows = RunOperation.run(opSplitCellIntoRows, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, Generators.modification);
export const eraseColumns = RunOperation.run(opEraseColumns, RunOperation.onUnlockedCells, resize, prune, Generators.modification);
export const eraseRows = RunOperation.run(opEraseRows, RunOperation.onCells, Fun.noop, prune, Generators.modification);
export const makeColumnHeader = RunOperation.run(opMakeColumnHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, Generators.transform('row', 'th'));
export const makeColumnsHeader = RunOperation.run(opMakeColumnsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, Generators.transform('row', 'th'));
export const unmakeColumnHeader = RunOperation.run(opUnmakeColumnHeader, RunOperation.onUnlockedCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const unmakeColumnsHeader = RunOperation.run(opUnmakeColumnsHeader, RunOperation.onUnlockedCells, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const makeRowHeader = RunOperation.run(opMakeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th'));
export const makeRowsHeader = RunOperation.run(opMakeRowsHeader, RunOperation.onCells, Fun.noop, Fun.noop, Generators.transform('col', 'th'));
export const unmakeRowHeader = RunOperation.run(opUnmakeRowHeader, RunOperation.onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const unmakeRowsHeader = RunOperation.run(opUnmakeRowsHeader, RunOperation.onCells, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const mergeCells = RunOperation.run(opMergeCells, RunOperation.onUnlockedMergable, Fun.noop, Fun.noop, Generators.merging);
export const unmergeCells = RunOperation.run(opUnmergeCells, RunOperation.onUnlockedUnmergable, resize, Fun.noop, Generators.merging);
export const pasteCells = RunOperation.run(opPasteCells, RunOperation.onPaste, resize, Fun.noop, Generators.modification);
export const pasteColsBefore = RunOperation.run(opPasteColsBefore, pasteColumnsExtractor(true), Fun.noop, Fun.noop, Generators.modification);
export const pasteColsAfter = RunOperation.run(opPasteColsAfter, pasteColumnsExtractor(false), Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsBefore = RunOperation.run(opPasteRowsBefore, RunOperation.onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsAfter = RunOperation.run(opPasteRowsAfter, RunOperation.onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const getColumnType = opGetColumnType;
