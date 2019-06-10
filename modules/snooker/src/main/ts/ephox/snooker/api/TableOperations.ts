import { Arr, Fun, Option, Struct } from '@ephox/katamari';
import { Remove, Element } from '@ephox/sugar';
import DetailsList from '../model/DetailsList';
import { run, onCell, onCells, onMergable, onUnmergable, onPaste, onPasteRows, ExtractPasteRows, ExtractPaste, ExtractMergable } from '../model/RunOperation';
import TableMerge from '../model/TableMerge';
import Transitions from '../model/Transitions';
import { Warehouse } from '../model/Warehouse';
import MergingOperations from '../operate/MergingOperations';
import ModificationOperations from '../operate/ModificationOperations';
import TransformOperations from '../operate/TransformOperations';
import Adjustments from '../resize/Adjustments';
import { GeneratorsModification, GeneratorsTransform, GeneratorsMerging, Generators, SimpleGenerators } from './Generators';
import * as Structs from './Structs';
import TableContent from './TableContent';
import TableLookup from './TableLookup';

export interface TableOperationResult {
  grid: () => Structs.RowCells[];
  cursor: () => Option<Element>;
}

type CompElm = (e1: Element, e2: Element) => boolean;

const prune = function (table: Element) {
  const cells = TableLookup.cells(table);
  if (cells.length === 0) {
    Remove.remove(table);
  }
};

const outcome: (grid: Structs.RowCells[], cursor: Option<Element>) => TableOperationResult = Struct.immutable('grid', 'cursor');

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
      }) ? rest : rest.concat([detail]);
    }, [] as Structs.DetailExt[]).sort(function (detailA, detailB) {
    return detailA.row() - detailB.row();
  });
};

const uniqueColumns = function (details: Structs.DetailExt[]) {
  return Arr.foldl(details, function (rest, detail) {
    return Arr.exists(rest, function (currentDetail) {
        return currentDetail.column() === detail.column();
      }) ? rest : rest.concat([detail]);
    }, [] as Structs.DetailExt[]).sort(function (detailA, detailB) {
    return detailA.column() - detailB.column();
  });
};

const insertRowBefore = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.row();
  const targetIndex = detail.row();
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column());
};

const insertRowsBefore = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = details[0].row();
  const targetIndex = details[0].row();
  const rows = uniqueRows(details);
  const newGrid = Arr.foldl(rows, function (newG, _row) {
    return ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, targetIndex, details[0].column());
};

const insertRowAfter = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.row();
  const targetIndex = detail.row() + detail.rowspan();
  const newGrid = ModificationOperations.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, targetIndex, detail.column());
};

const insertRowsAfter = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const rows = uniqueRows(details);
  const example = rows[rows.length - 1].row();
  const targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
  const newGrid = Arr.foldl(rows, function (newG, _row) {
    return ModificationOperations.insertRowAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, targetIndex, details[0].column());
};

const insertColumnBefore = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.column();
  const targetIndex = detail.column();
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), targetIndex);
};

const insertColumnsBefore = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const columns = uniqueColumns(details);
  const example = columns[0].column();
  const targetIndex = columns[0].column();
  const newGrid = Arr.foldl(columns, function (newG, _row) {
    return ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, details[0].row(), targetIndex);
};

const insertColumnAfter = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = detail.column();
  const targetIndex = detail.column() + detail.colspan();
  const newGrid = ModificationOperations.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), targetIndex);
};

const insertColumnsAfter = function (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, genWrappers: GeneratorsModification) {
  const example = details[details.length - 1].column();
  const targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
  const columns = uniqueColumns(details);
  const newGrid = Arr.foldl(columns, function (newG, _row) {
    return ModificationOperations.insertColumnAt(newG, targetIndex, example, comparator, genWrappers.getOrInit);
  }, grid);
  return bundle(newGrid, details[0].row(), targetIndex);
};

const makeRowHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const makeColumnHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const unmakeRowHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid =  TransformOperations.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const unmakeColumnHeader = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsTransform) {
  const newGrid = TransformOperations.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const splitCellIntoColumns = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const newGrid = ModificationOperations.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const splitCellIntoRows = function (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, genWrappers: GeneratorsModification) {
  const newGrid = ModificationOperations.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
  return bundle(newGrid, detail.row(), detail.column());
};

const eraseColumns = function (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) {
  const columns = uniqueColumns(details);

  const newGrid = ModificationOperations.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
  const cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
  return outcome(newGrid, cursor);
};

const eraseRows = function (grid: Structs.RowCells[], details: Structs.DetailExt[], _comparator: CompElm, _genWrappers: GeneratorsModification) {
  const rows = uniqueRows(details);

  const newGrid = ModificationOperations.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
  const cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
  return outcome(newGrid, cursor);
};

const mergeCells = function (grid: Structs.RowCells[], mergable: ExtractMergable, comparator: CompElm, _genWrappers: GeneratorsMerging) {
  const cells = mergable.cells();
  TableContent.merge(cells);
  const newGrid = MergingOperations.merge(grid, mergable.bounds(), comparator, Fun.constant(cells[0]));
  return outcome(newGrid, Option.from(cells[0]));
};

const unmergeCells = function (grid: Structs.RowCells[], unmergable: Element[], comparator: CompElm, genWrappers: GeneratorsMerging) {
  const newGrid = Arr.foldr(unmergable, function (b, cell) {
    return MergingOperations.unmerge(b, cell, comparator, genWrappers.combine(cell));
  }, grid);
  return outcome(newGrid, Option.from(unmergable[0]));
};

const pasteCells = function (grid: Structs.RowCells[], pasteDetails: ExtractPaste, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const gridify = function (table: Element, generators: SimpleGenerators) {
    const list = DetailsList.fromTable(table);
    const wh = Warehouse.generate(list);
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

const pasteRowsBefore = function (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[0].row();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insert(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

const pasteRowsAfter = function (grid: Structs.RowCells[], pasteDetails: ExtractPasteRows, comparator: CompElm, _genWrappers: GeneratorsModification) {
  const example = grid[pasteDetails.cells[0].row()];
  const index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
  const gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
  const mergedGrid = TableMerge.insert(index, grid, gridB, pasteDetails.generators(), comparator);
  const cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
  return outcome(mergedGrid, cursor);
};

// Only column modifications force a resizing. Everything else just tries to preserve the table as is.
const resize = Adjustments.adjustWidthTo;

export default {
  insertRowBefore: run(insertRowBefore, onCell, Fun.noop, Fun.noop, Generators.modification),
  insertRowsBefore: run(insertRowsBefore, onCells, Fun.noop, Fun.noop, Generators.modification),
  insertRowAfter:  run(insertRowAfter, onCell, Fun.noop, Fun.noop, Generators.modification),
  insertRowsAfter: run(insertRowsAfter, onCells, Fun.noop, Fun.noop, Generators.modification),
  insertColumnBefore:  run(insertColumnBefore, onCell, resize, Fun.noop, Generators.modification),
  insertColumnsBefore: run(insertColumnsBefore, onCells, resize, Fun.noop, Generators.modification),
  insertColumnAfter:  run(insertColumnAfter, onCell, resize, Fun.noop, Generators.modification),
  insertColumnsAfter: run(insertColumnsAfter, onCells, resize, Fun.noop, Generators.modification),
  splitCellIntoColumns:  run(splitCellIntoColumns, onCell, resize, Fun.noop, Generators.modification),
  splitCellIntoRows:  run(splitCellIntoRows, onCell, Fun.noop, Fun.noop, Generators.modification),
  eraseColumns:  run(eraseColumns, onCells, resize, prune, Generators.modification),
  eraseRows:  run(eraseRows, onCells, Fun.noop, prune, Generators.modification),
  makeColumnHeader:  run(makeColumnHeader, onCell, Fun.noop, Fun.noop, Generators.transform('row', 'th')),
  unmakeColumnHeader:  run(unmakeColumnHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
  makeRowHeader:  run(makeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform('col', 'th')),
  unmakeRowHeader:  run(unmakeRowHeader, onCell, Fun.noop, Fun.noop, Generators.transform(null, 'td')),
  mergeCells: run(mergeCells, onMergable, Fun.noop, Fun.noop, Generators.merging),
  unmergeCells: run(unmergeCells, onUnmergable, resize, Fun.noop, Generators.merging),
  pasteCells: run(pasteCells, onPaste, resize, Fun.noop, Generators.modification),
  pasteRowsBefore: run(pasteRowsBefore, onPasteRows, Fun.noop, Fun.noop, Generators.modification),
  pasteRowsAfter: run(pasteRowsAfter, onPasteRows, Fun.noop, Fun.noop, Generators.modification)
};