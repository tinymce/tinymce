import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import * as Structs from '../api/Structs';
import { TableSection } from '../api/TableSection';
import { isHeaderCell, isHeaderCells } from '../lookup/Type';
import * as GridRow from '../model/GridRow';
import * as CellUtils from '../util/CellUtils';

type CompElm = (e1: SugarElement, e2: SugarElement) => boolean;
type Subst = (element: SugarElement, comparator: CompElm) => SugarElement;
type CellReplacer = (cell: Structs.ElementNew, comparator: CompElm, substitute: Subst) => Structs.ElementNew;
type ScopeGenerator = (cell: Structs.ElementNew, rowIndex: number, colIndex: number) => Optional<null | string>;
type ReplacePredicate = (cell: Structs.ElementNew, rowIndex: number, colIndex: number) => boolean;

const notStartRow = (grid: Structs.RowCells[], rowIndex: number, colIndex: number, comparator: CompElm): boolean =>
  GridRow.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator(GridRow.getCellElement(grid[rowIndex - 1], colIndex), GridRow.getCellElement(grid[rowIndex], colIndex)));

const notStartColumn = (row: Structs.RowCells, index: number, comparator: CompElm): boolean =>
  index > 0 && comparator(GridRow.getCellElement(row, index - 1), GridRow.getCellElement(row, index));

const alreadyProcessed = (grid: Structs.RowCells[], rowIndex: number, colIndex: number, comparator: CompElm): boolean =>
  notStartRow(grid, rowIndex, colIndex, comparator) || notStartColumn(grid[rowIndex], colIndex, comparator);

const rowReplacerPredicate = (targetRow: Structs.RowCells, columnHeaders: boolean[]): ReplacePredicate => {
  const entireTableIsHeader = Arr.forall(columnHeaders, Fun.identity) && isHeaderCells(targetRow.cells);
  return entireTableIsHeader ? Fun.always : (cell, rowIndex, colIndex) => {
    const type = SugarNode.name(cell.element);
    return !(type === 'th' && columnHeaders[colIndex]);
  };
};

const columnReplacePredicate = (targetColumn: Structs.ElementNew[], rowHeaders: boolean[]): ReplacePredicate => {
  const entireTableIsHeader = Arr.forall(rowHeaders, Fun.identity) && isHeaderCells(targetColumn);
  return entireTableIsHeader ? Fun.always : (cell, rowIndex, _colIndex) => {
    const type = SugarNode.name(cell.element);
    return !(type === 'th' && rowHeaders[rowIndex]);
  };
};

const determineScope = (applyScope: boolean, element: SugarElement<HTMLTableCellElement>, newScope: 'row' | 'col', isInHeader: boolean) => {
  const hasSpan = (scope: string) => scope === 'row' ? CellUtils.hasRowspan(element) : CellUtils.hasColspan(element);
  const getScope = (scope: string) => hasSpan(scope) ? `${scope}group` : scope;

  if (applyScope) {
    // Add the scope depending on if there is a merged cell
    return isHeaderCell(element) ? getScope(newScope) : null;
  } else if (isInHeader && isHeaderCell(element)) {
    // The cell is still in a header row/column so ensure the right scope is reverted to
    const oppositeScope = newScope === 'row' ? 'col' : 'row';
    return getScope(oppositeScope);
  } else {
    // No longer a header so ensure the scope is removed
    return null;
  }
};

const rowScopeGenerator = (applyScope: boolean, columnHeaders: boolean[]) => (cell: Structs.ElementNew, rowIndex: number, columnIndex: number) =>
  Optional.some(determineScope(applyScope, cell.element, 'col', columnHeaders[columnIndex]));

const columnScopeGenerator = (applyScope: boolean, rowHeaders: boolean[]) => (cell: Structs.ElementNew, rowIndex: number) =>
  Optional.some(determineScope(applyScope, cell.element, 'row', rowHeaders[rowIndex]));

const replace = (cell: Structs.ElementNew, comparator: CompElm, substitute: Subst) =>
  Structs.elementnew(substitute(cell.element, comparator), true, cell.isLocked);

const replaceIn = (
  grid: Structs.RowCells[],
  targets: Structs.ElementNew[],
  comparator: CompElm,
  substitute: Subst,
  replacer: CellReplacer,
  genScope: ScopeGenerator,
  shouldReplace: ReplacePredicate
): Structs.RowCells[] => {
  const isTarget = (cell: Structs.ElementNew) => {
    return Arr.exists(targets, (target) => {
      return comparator(cell.element, target.element);
    });
  };

  return Arr.map(grid, (row, rowIndex) => {
    return GridRow.mapCells(row, (cell, colIndex) => {
      if (isTarget(cell)) {
        const newCell = shouldReplace(cell, rowIndex, colIndex) ? replacer(cell, comparator, substitute) : cell;
        // Update the scope
        genScope(newCell, rowIndex, colIndex).each((scope) => {
          Attribute.setOptions(newCell.element, { scope: Optional.from(scope) });
        });
        return newCell;
      } else {
        return cell;
      }
    });
  });
};

const getColumnCells = (rows: Structs.RowCells[], columnIndex: number, comparator: CompElm) =>
  Arr.bind(rows, (row, i) => {
    // check if already added.
    return alreadyProcessed(rows, i, columnIndex, comparator) ? [] : [ GridRow.getCell(row, columnIndex) ];
  });

const getRowCells = (rows: Structs.RowCells[], rowIndex: number, comparator: CompElm) => {
  const targetRow = rows[rowIndex];
  return Arr.bind(targetRow.cells, (item, i) => {
    // Check that we haven't already added this one.
    return alreadyProcessed(rows, rowIndex, i, comparator) ? [] : [ item ];
  });
};

const replaceColumn = (grid: Structs.RowCells[], index: number, applyScope: boolean, comparator: CompElm, substitution: Subst): Structs.RowCells[] =>
  replaceColumns(grid, [ index ], applyScope, comparator, substitution);

const replaceColumns = (grid: Structs.RowCells[], indexes: number[], applyScope: boolean, comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  // Make this efficient later.
  const rows = GridRow.extractGridDetails(grid).rows;
  const targets = Arr.bind(indexes, (index) => getColumnCells(rows, index, comparator));
  const rowHeaders = Arr.map(grid, (row) => isHeaderCells(row.cells));

  const shouldReplaceCell = columnReplacePredicate(targets, rowHeaders);
  const scopeGenerator = columnScopeGenerator(applyScope, rowHeaders);

  return replaceIn(grid, targets, comparator, substitution, replace, scopeGenerator, shouldReplaceCell);
};

const replaceRow = (grid: Structs.RowCells[], index: number, section: Structs.Section, applyScope: boolean, comparator: CompElm, substitution: Subst, tableSection: TableSection): Structs.RowCells[] =>
  replaceRows(grid, [ index ], section, applyScope, comparator, substitution, tableSection);

const replaceRows = (grid: Structs.RowCells[], indexes: number[], section: Structs.Section, applyScope: boolean, comparator: CompElm, substitution: Subst, tableSection: TableSection): Structs.RowCells[] => {
  const { cols, rows } = GridRow.extractGridDetails(grid);
  const targetRow = rows[indexes[0]];
  const targets = Arr.bind(indexes, (index) => getRowCells(rows, index, comparator));
  const columnHeaders = Arr.map(targetRow.cells, (_cell, index) => isHeaderCells(getColumnCells(rows, index, comparator)));

  // Transform and replace the target row
  // TODO: TINY-7776: This doesn't deal with rowspans which can break the layout when moving to a new section
  const newRows = [ ...rows ];
  Arr.each(indexes, (index) => {
    newRows[index] = tableSection.transformRow(rows[index], section);
  });
  const newGrid = cols.concat(newRows);

  const shouldReplaceCell = rowReplacerPredicate(targetRow, columnHeaders);
  const scopeGenerator = rowScopeGenerator(applyScope, columnHeaders);

  return replaceIn(newGrid, targets, comparator, substitution, tableSection.transformCell, scopeGenerator, shouldReplaceCell);
};

const replaceCell = (grid: Structs.RowCells[], detail: Structs.DetailExt, comparator: CompElm, substitution: Subst): Structs.RowCells[] =>
  replaceCells(grid, [ detail ], comparator, substitution);

const replaceCells = (grid: Structs.RowCells[], details: Structs.DetailExt[], comparator: CompElm, substitution: Subst): Structs.RowCells[] => {
  const rows = GridRow.extractGridDetails(grid).rows;
  const targetCells = Arr.map(details, (detail) => GridRow.getCell(rows[detail.row], detail.column));
  return replaceIn(grid, targetCells, comparator, substitution, replace, Optional.none, Fun.always);
};

export {
  replaceColumn,
  replaceColumns,
  replaceRow,
  replaceRows,
  replaceCell,
  replaceCells
};
