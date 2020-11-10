import { Arr, Optional } from '@ephox/katamari';
import { Class, Css, Height, Insert, Remove, SelectorFilter, SugarElement, SugarLocation, SugarPosition, Width } from '@ephox/sugar';
import { ResizeWire } from '../api/ResizeWire';
import * as Blocks from '../lookup/Blocks';
import { Warehouse } from '../api/Warehouse';
import * as Styles from '../style/Styles';
import * as Bar from './Bar';
import * as BarPositions from './BarPositions';

const resizeBar = Styles.resolve('resizer-bar');
const resizeRowBar = Styles.resolve('resizer-rows');
const resizeColBar = Styles.resolve('resizer-cols');
const BAR_THICKNESS = 7;

const resizableRows = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, isResizable: (table: SugarElement<HTMLTableElement>, elm: SugarElement<Element>) => boolean): number[] => {
  const rows = warehouse.all;
  const resizableRows: number[] = [];
  Arr.each(rows, (row, i) => {
    if (isResizable(table, row.element)) {
      resizableRows.push(i);
    }
  });
  return resizableRows;
};

const resizableColumns = (warehouse: Warehouse, table: SugarElement<HTMLTableElement>, isResizable: (table: SugarElement<HTMLTableElement>, elm: SugarElement<Element>) => boolean): number[] => {
  const resizableCols: number[] = [];
  // Check col elements and see if they are resizable
  Arr.range(warehouse.grid.columns, (index) => {
    // With use of forall, will return true if col doesn't exist meaning the cells will be checked below
    if (Warehouse.getColumnAt(warehouse, index).map((col) => col.element).forall((col) => isResizable(table, col))) {
      resizableCols.push(index);
    }
  });
  // Check cells of the resizable columnss and make sure they are resizable
  return Arr.filter(resizableCols, (colIndex) => {
    const columnCells = Warehouse.filterItems(warehouse, (cell) => cell.column === colIndex);
    return Arr.forall(columnCells, (cell) => isResizable(table, cell.element));
  });
};

const destroy = function (wire: ResizeWire) {
  const previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(previous, Remove.remove);
};

const drawBar = function <T> (wire: ResizeWire, positions: Optional<T>[], create: (origin: SugarPosition, info: T) => SugarElement) {
  const origin = wire.origin();
  Arr.each(positions, function (cpOption) {
    cpOption.each(function (cp) {
      const bar = create(origin, cp);
      Class.add(bar, resizeBar);
      Insert.append(wire.parent(), bar);
    });
  });
};

const refreshCol = function (wire: ResizeWire, colPositions: Optional<BarPositions.ColInfo>[], position: SugarPosition, tableHeight: number) {
  drawBar(wire, colPositions, function (origin, cp) {
    const colBar = Bar.col(cp.col, cp.x - origin.left, position.top - origin.top, BAR_THICKNESS, tableHeight);
    Class.add(colBar, resizeColBar);
    return colBar;
  });
};

const refreshRow = function (wire: ResizeWire, rowPositions: Optional<BarPositions.RowInfo>[], position: SugarPosition, tableWidth: number) {
  drawBar(wire, rowPositions, function (origin, cp) {
    const rowBar = Bar.row(cp.row, position.left - origin.left, cp.y - origin.top, tableWidth, BAR_THICKNESS);
    Class.add(rowBar, resizeRowBar);
    return rowBar;
  });
};

const refreshGrid = function (warhouse: Warehouse, wire: ResizeWire, table: SugarElement, rows: Optional<SugarElement>[], cols: Optional<SugarElement>[]) {
  const position = SugarLocation.absolute(table);
  const isResizable = wire.isResizable;
  const rowPositions = rows.length > 0 ? BarPositions.height.positions(rows, table) : [];
  const resizableRowBars = rowPositions.length > 0 ? resizableRows(warhouse, table, isResizable) : [];
  const resizableRowPositions = Arr.filter(rowPositions, (_pos, i) => Arr.exists(resizableRowBars, (barIndex) => i === barIndex ));
  refreshRow(wire, resizableRowPositions, position, Width.getOuter(table));

  const colPositions = cols.length > 0 ? BarPositions.width.positions(cols, table) : [];
  const resizableColBars = colPositions.length > 0 ? resizableColumns(warhouse, table, isResizable) : [];
  const resizableColPositions = Arr.filter(colPositions, (_pos, i) => Arr.exists(resizableColBars, (barIndex) => i === barIndex ));
  refreshCol(wire, resizableColPositions, position, Height.getOuter(table));
};

const refresh = function (wire: ResizeWire, table: SugarElement) {
  destroy(wire);
  if (wire.isResizable(table, table)) {
    const warehouse = Warehouse.fromTable(table);
    const rows = Blocks.rows(warehouse);
    const cols = Blocks.columns(warehouse);
    refreshGrid(warehouse, wire, table, rows, cols);
  }
};

const each = function (wire: ResizeWire, f: (bar: SugarElement, idx: number) => void) {
  const bars = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(bars, f);
};

const hide = function (wire: ResizeWire) {
  each(wire, function (bar) {
    Css.set(bar, 'display', 'none');
  });
};

const show = function (wire: ResizeWire) {
  each(wire, function (bar) {
    Css.set(bar, 'display', 'block');
  });
};

const isRowBar = function (element: SugarElement) {
  return Class.has(element, resizeRowBar);
};

const isColBar = function (element: SugarElement) {
  return Class.has(element, resizeColBar);
};

export {
  refresh,
  hide,
  show,
  destroy,
  isRowBar,
  isColBar
};
