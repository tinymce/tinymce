import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, Node, Remove } from '@ephox/sugar';
import * as DetailsList from '../model/DetailsList';
import { ExtractMergable, ExtractPaste, ExtractPasteRows, onCell, onCells, onMergable, onPaste, onPasteByEditor, onUnmergable, run, TargetSelection } from '../model/RunOperation';
import * as TableMerge from '../model/TableMerge';
import * as Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import * as MergingOperations from '../operate/MergingOperations';
import * as ModificationOperations from '../operate/ModificationOperations';
import * as TransformOperations from '../operate/TransformOperations';
import * as Adjustments from '../resize/Adjustments';
import { Generators, GeneratorsMerging, GeneratorsModification, GeneratorsTransform, SimpleGenerators } from './Generators';
import * as Structs from './Structs';
import * as TableContent from './TableContent';
import * as TableLookup from './TableLookup';

export interface TableOperationResult {
  readonly grid: () => Structs.RowCells[];
  readonly cursor: () => Option<Element>;
}

type CompElm = (e1: Element, e2: Element) => boolean;

const prune = function (table: Element) {
  const cells = TableLookup.cells(table);
  if (cells.length === 0) {
    Remove.remove(table);
  }
};

const outcome = (grid: Structs.RowCells[], cursor: Option<Element>): TableOperationResult => ({
  grid: Fun.constant(grid),
  cursor: Fun.constant(cursor)
});

const elementFromGrid = function (grid: Structs.RowCells[], row: number, column: number) {
  return findIn(grid, row, column).orThunk(function () {
    return findIn(grid, 0, 0);
  });
};

const findIn = function (grid: Structs.RowCells[], row: number, column: number) {
  return Option.from(grid[row]).bind(function (r) {
    return Option.from(r.cells()[column]).bind(function (c) {
      return Option.from(c.element());
    });
  });
};

const bundle = function (grid: Structs.RowCells[], row: number, column: number) {
  return outcome(grid, findIn(grid, row, column));
};

const uniqueRows = function (details: Structs.DetailExt[]) {
  return Arr.foldl(details, function (rest, detail) {
    return Arr.exists(rest, function (currentDetail) {
      return currentDetail.row() === detail.row();
    }) ? rest : rest.concat([ detail ]);
  }, [] as Structs.DetailExt[]).sort(function (detailA, detailB) {
    return detailA.row() - detailB.row();
  });
};

const uniqueColumns = function (details: Structs.DetailExt[]) {
  return Arr.foldl(details, function (rest, detail) {
    return Arr.exists(rest, function (currentDetail) {
      return currentDetail.column() === detail.column();
    }) ? rest : rest.concat([ detail ]);
  }, [] as Structs.DetailExt[]).sort(function (detailA, detailB) {
    return detailA.column() - detailB.column();
  });
};

const opInsertRowBefore = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.row();
  const targetIndex = detail.row();
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column());
};

const opInsertRowsBefore = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = details[0].row();
  const targetIndex = details[0].row();
  const rows = uniqueRows(details);
  const newGrid = Arr.foldl(rows, function (newG, _row) {
    return ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, targetIndex, details[0].column());
};

const opInsertRowAfter = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.row();
  const targetIndex = detail.row() + detail.rowspan();
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column());
};

const opInsertRowsAfter = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const rows = uniqueRows(details);
  const example = rows[rows.length - 1].row();
  const targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
  const newGrid = Arr.foldl(rows, function (newG, _row) {
    return ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, targetIndex, details[0].column());
};

const opInsertColumnBefore = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.column();
  const targetIndex = detail.column();
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), targetIndex);
};

const opInsertColumnsBefore = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const columns = uniqueColumns(details);
  const example = columns[0].column();
  const targetIndex = columns[0].column();
  const newGrid = Arr.foldl(columns, function (newG, _row) {
    return ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, details[0].row(), targetIndex);
};

const opInsertColumnAfter = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.column();
  const targetIndex = detail.column() + detail.colspan();
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), targetIndex);
};

const opInsertColumnsAfter = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = details[details.length - 1].column();
  const targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
  const columns = uniqueColumns(details);
  const newGrid = Arr.foldl(columns, function (newG, _row) {
    return ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, details[0].row(), targetIndex);
};

const opMakeRowHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opMakeColumnHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opUnmakeRowHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opUnmakeColumnHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opSplitCellIntoColumns = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const newGrid = ModificationOperations.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opSplitCellIntoRows = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const newGrid = ModificationOperations.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const opEraseColumns = function (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) {
  const columns = uniqueColumns(details);

  const newGrid = ModificationOperations.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
  const cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
  return outcome(newGrid, cursor);
};

const opEraseRows = function (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) {
  const rows = uniqueRows(details);

  const newGrid = ModificationOperations.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
  const cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
  return outcome(newGrid, cursor);
};

const opMergeCells = function (grid: Structs.RowCells[], mergable: ExtractMergable, comparator: CompElm, _genWrappers: GeneratorsMerging) {
  const cells = mergable.cells();
  TableContent.merge(cells);
  const newGrid = MergingOperations.merge(grid, mergable.bounds(), comparator, Fun.constant(cells[0]));
  return outcome(newGrid, Option.from(cells[0]));
};

const opUnmergeCells = function (grid: Structs.RowCells[], unmergable: Element[], comparator: CompElm, genWrappers: GeneratorsMerging) {
  const newGrid = Arr.foldr(unmergable, function (b, cell) {
    return MergingOperations.unmerge(b, cell, comparator, genWrappers.combine(cell));
  }, grid);
  return outcome(newGrid, Option.from(unmergable[0]));
};

const opPasteCells = function (grid: Structs.RowCells[], pasteDetails: ExtractPaste, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const gridify = function (table: Element, generators: SimpleGenerators) {
    const wh = Warehouse.fromTable(table);
    return Transitions.toGrid(wh, generators, true);
  };
  const gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
  const startAddress = Structs.address(pasteDetails.row(), pasteDetails.column());
  const mergedGrid = TableMerge.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
  return mergedGrid.fold(function () {
    return outcome(grid, Option.some(pasteDetails.element()));
  }, function (nuGrid) {
    const cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
    return outcome(nuGrid, cursor);
  });
};

const gridifyRows = function (rows: Element[], generators: Generators, example: Structs.RowCells) {
  const pasteDetails = DetailsList.fromPastedRows(rows, example);
  const wh = Warehouse.generate(pasteDetails);
  return Transitions.toGrid(wh, generators, true);
};

const opPasteColsBefore = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[0].column();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insertCols(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

const opPasteColsAfter = (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) => {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].column() + pasteDetails.cells[pasteDetails.cells.length - 1].colspan();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insertCols(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

const opPasteRowsBefore = function (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[0].row();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

const opPasteRowsAfter = function (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insertRows(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

const opGetColumnType = (table: Element, target: TargetSelection): string => {
  const house = Warehouse.fromTable(table);
  const details = onCells(house, target);
  return details.bind((selectedCells): Option<string> => {
    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    const minColRange = selectedCells[0].column();
    const maxColRange = lastSelectedCell.column() + lastSelectedCell.colspan();
    const selectedColumnCells = Arr.flatten(Arr.map(house.all, (row) =>
      Arr.filter(row.cells(), (cell) => cell.column() >= minColRange && cell.column() < maxColRange)));
    return getCellsType(selectedColumnCells, (cell) => Node.name(cell.element()) === 'th');
  }).getOr('');
};

export const getCellsType = <T>(cells: T[], headerPred: (x: T) => boolean): Option<string> => {
  const headerCells = Arr.filter(cells, headerPred);
  if (headerCells.length === 0) {
    return Option.some('td');
  } else if (headerCells.length === cells.length) {
    return Option.some('th');
  } else {
    return Option.none();
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
export const unmakeColumnHeader = run(opUnmakeColumnHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const makeRowHeader = run(opMakeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th'));
export const unmakeRowHeader = run(opUnmakeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td'));
export const mergeCells = run(opMergeCells, onMergable, Fun.noop, Fun.noop, Generators.merging);
export const unmergeCells = run(opUnmergeCells, onUnmergable, resize, Fun.noop, Generators.merging);
export const pasteCells = run(opPasteCells, onPaste, resize, Fun.noop, Generators.modification);
export const pasteColsBefore = run(opPasteColsBefore, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteColsAfter = run(opPasteColsAfter, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsBefore = run(opPasteRowsBefore, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const pasteRowsAfter = run(opPasteRowsAfter, onPasteByEditor, Fun.noop, Fun.noop, Generators.modification);
export const getColumnType = opGetColumnType;