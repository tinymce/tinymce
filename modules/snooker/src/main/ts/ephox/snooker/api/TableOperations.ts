import { Arr, Fun, Optional } from '@ephox/katamari';
import { Remove, SugarElement, SugarNode } from '@ephox/sugar';
import * as DetailsList from '../model/DetailsList';
import * as GridRow from '../model/GridRow';
import {
  ExtractMergable, ExtractPaste, ExtractPasteRows, onCell, onCells, onMergable, onPaste, onPasteByEditor, onUnmergable, run, TargetSelection
} from '../model/RunOperation';
import * as TableMerge from '../model/TableMerge';
import * as Transitions from '../model/Transitions';
import * as MergingOperations from '../operate/MergingOperations';
import * as ModificationOperations from '../operate/ModificationOperations';
import * as TransformOperations from '../operate/TransformOperations';
import * as Adjustments from '../resize/Adjustments';
import { Generators, GeneratorsMerging, GeneratorsModification, GeneratorsTransform, SimpleGenerators } from './Generators';
import * as Structs from './Structs';
import * as TableContent from './TableContent';
import * as TableLookup from './TableLookup';
import { Warehouse } from './Warehouse';

export interface TableOperationResult {
  readonly grid: Structs.RowCells[];
  readonly cursor: Optional<SugarElement>;
}

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

const uniqueColumns = (details: Structs.DetailExt[]) => {
  const uniqueCheck = (rest: Structs.DetailExt[], detail: Structs.DetailExt) => {
    const columnExists = Arr.exists(rest, (currentDetail) => currentDetail.column === detail.column);

    return columnExists ? rest : rest.concat([ detail ]);
  };

  return Arr.foldl(details, uniqueCheck, []).sort((detailA, detailB) =>
    detailA.column - detailB.column
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
  const columns = uniqueColumns(details);
  const example = columns[0].column;
  const targetIndex = columns[0].column;
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
  const example = details[details.length - 1].column;
  const targetIndex = details[details.length - 1].column + details[details.length - 1].colspan;
  const columns = uniqueColumns(details);
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
  const columns = uniqueColumns(details);

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
  const columns = uniqueColumns(details);

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
  const columns = uniqueColumns(details);

  const newGrid = ModificationOperations.deleteColumnsAt(grid, columns[0].column, columns[columns.length - 1].column);
  const cursor = elementFromGrid(newGrid, details[0].row, details[0].column);
  return outcome(newGrid, cursor);
};

const opEraseRows = (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const rows = uniqueRows(details);

  const newGrid = ModificationOperations.deleteRowsAt(grid, rows[0].row, rows[rows.length - 1].row);
  const cursor = elementFromGrid(newGrid, details[0].row, details[0].column);
  return outcome(newGrid, cursor);
};

const opMergeCells = (grid: Structs.RowCells[], mergable: ExtractMergable, comparator: CompElm, _genWrappers: GeneratorsMerging) => {
  const cells = mergable.cells;
  TableContent.merge(cells);
  const newGrid = MergingOperations.merge(grid, mergable.bounds, comparator, Fun.constant(cells[0]));
  return outcome(newGrid, Optional.from(cells[0]));
};

const opUnmergeCells = (grid: Structs.RowCells[], unmergable: SugarElement[], comparator: CompElm, genWrappers: GeneratorsMerging) => {
  const newGrid = Arr.foldr(unmergable, (b, cell) => MergingOperations.unmerge(b, cell, comparator, genWrappers.combine(cell)), grid);
  return outcome(newGrid, Optional.from(unmergable[0]));
};

const opPasteCells = (grid: Structs.RowCells[], pasteDetails: ExtractPaste, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const gridify = (table: SugarElement, generators: SimpleGenerators) => {
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
  const details = onCells(house, target);
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

export const insertRowBefore = run(opInsertRowBefore, onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsBefore = run(opInsertRowsBefore, onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertRowAfter = run(opInsertRowAfter, onCell, Fun.noop, Fun.noop, Generators.modification);
export const insertRowsAfter = run(opInsertRowsAfter, onCells, Fun.noop, Fun.noop, Generators.modification);
export const insertColumnBefore = run(opInsertColumnBefore, onCell, resize, Fun.noop, Generators.modification);
export const insertColumnsBefore = run(opInsertColumnsBefore, onCells, resize, Fun.noop, Generators.modification);
export const insertColumnAfter = run(opInsertColumnAfter, onCell, resize, Fun.noop, Generators.modification);
export const insertColumnsAfter = run(opInsertColumnsAfter, onCells, resize, Fun.noop, Generators.modification);
export const splitCellIntoColumns = run(opSplitCellIntoColumns, onCell, resize, Fun.noop, Generators.modification);
export const splitCellIntoRows = run(opSplitCellIntoRows, onCell, Fun.noop, Fun.noop, Generators.modification);
export const eraseColumns = run(opEraseColumns, onCells, resize, prune, Generators.modification);
export const eraseRows = run(opEraseRows, onCells, Fun.noop, prune, Generators.modification);
export const makeColumnHeader = run(opMakeColumnHeader, onCell, Fun.noop, Fun.noop, Generators.transform('row', 'th'));
export const makeColumnsHeader = run(opMakeColumnsHeader, onCells, Fun.noop, Fun.noop, Generators.transform('row', 'th'));
export const unmakeColumnHeader = run(opUnmakeColumnHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const unmakeColumnsHeader = run(opUnmakeColumnsHeader, onCells, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const makeRowHeader = run(opMakeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th'));
export const makeRowsHeader = run(opMakeRowsHeader, onCells, Fun.noop, Fun.noop, Generators.transform('col', 'th'));
export const unmakeRowHeader = run(opUnmakeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const unmakeRowsHeader = run(opUnmakeRowsHeader, onCells, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const mergeCells = run(opMergeCells, onMergable, Fun.noop, Fun.noop, Generators.merging);
export const unmergeCells = run(opUnmergeCells, onUnmergable, resize, Fun.noop, Generators.merging);
export const pasteCells = run(opPasteCells, onPaste, resize, Fun.noop, Generators.modification);
export const pasteColsBefore = run(opPasteColsBefore, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteColsAfter = run(opPasteColsAfter, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsBefore = run(opPasteRowsBefore, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsAfter = run(opPasteRowsAfter, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const getColumnType = opGetColumnType;
