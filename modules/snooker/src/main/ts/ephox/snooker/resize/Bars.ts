import { Arr, Optional } from '@ephox/katamari';
import { Class, Css, Height, Insert, Remove, SelectorFilter, SugarElement, SugarLocation, SugarPosition, Width } from '@ephox/sugar';

import { ResizeWire } from '../api/ResizeWire';
import { Warehouse } from '../api/Warehouse';
import * as Blocks from '../lookup/Blocks';
import * as Styles from '../style/Styles';
import * as Bar from './Bar';
import * as BarPositions from './BarPositions';

const resizeBar = Styles.resolve('resizer-bar');
const resizeRowBar = Styles.resolve('resizer-rows');
const resizeColBar = Styles.resolve('resizer-cols');
const BAR_THICKNESS = 7;

const resizableRows = (warehouse: Warehouse, isResizable: (elm: SugarElement<Element>) => boolean): number[] =>
  Arr.bind(warehouse.all, (row, i) => isResizable(row.element) ? [ i ] : []);

const resizableColumns = (warehouse: Warehouse, isResizable: (elm: SugarElement<Element>) => boolean): number[] => {
  const resizableCols: number[] = [];
  // Check col elements and see if they are resizable
  Arr.range(warehouse.grid.columns, (index) => {
    // With use of forall, index will be included if col doesn't exist meaning the column cells will be checked below
    const colElmOpt = Warehouse.getColumnAt(warehouse, index).map((col) => col.element);
    if (colElmOpt.forall(isResizable)) {
      resizableCols.push(index);
    }
  });
  // Check cells of the resizable columns and make sure they are resizable
  return Arr.filter(resizableCols, (colIndex) => {
    const columnCells = Warehouse.filterItems(warehouse, (cell) => cell.column === colIndex);
    return Arr.forall(columnCells, (cell) => isResizable(cell.element));
  });
};

const destroy = (wire: ResizeWire): void => {
  const previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(previous, Remove.remove);
};

const drawBar = <T> (wire: ResizeWire, positions: Optional<T>[], create: (origin: SugarPosition, info: T) => SugarElement<HTMLDivElement>): void => {
  const origin = wire.origin();
  Arr.each(positions, (cpOption) => {
    cpOption.each((cp) => {
      const bar = create(origin, cp);
      Class.add(bar, resizeBar);
      Insert.append(wire.parent(), bar);
    });
  });
};

const refreshCol = (wire: ResizeWire, colPositions: Optional<BarPositions.ColInfo>[], position: SugarPosition, tableHeight: number): void => {
  drawBar(wire, colPositions, (origin, cp) => {
    const colBar = Bar.col(cp.col, cp.x - origin.left, position.top - origin.top, BAR_THICKNESS, tableHeight);
    Class.add(colBar, resizeColBar);
    return colBar;
  });
};

const refreshRow = (wire: ResizeWire, rowPositions: Optional<BarPositions.RowInfo>[], position: SugarPosition, tableWidth: number): void => {
  drawBar(wire, rowPositions, (origin, cp) => {
    const rowBar = Bar.row(cp.row, position.left - origin.left, cp.y - origin.top, tableWidth, BAR_THICKNESS);
    Class.add(rowBar, resizeRowBar);
    return rowBar;
  });
};

const refreshGrid = (warhouse: Warehouse, wire: ResizeWire, table: SugarElement<HTMLTableElement>, rows: Optional<SugarElement<HTMLTableCellElement>>[], cols: Optional<SugarElement<HTMLTableCellElement>>[]): void => {
  const position = SugarLocation.absolute(table);
  const isResizable = wire.isResizable;
  const rowPositions = rows.length > 0 ? BarPositions.height.positions(rows, table) : [];
  const resizableRowBars = rowPositions.length > 0 ? resizableRows(warhouse, isResizable) : [];
  const resizableRowPositions = Arr.filter(rowPositions, (_pos, i) => Arr.exists(resizableRowBars, (barIndex) => i === barIndex ));
  refreshRow(wire, resizableRowPositions, position, Width.getOuter(table));

  const colPositions = cols.length > 0 ? BarPositions.width.positions(cols, table) : [];
  const resizableColBars = colPositions.length > 0 ? resizableColumns(warhouse, isResizable) : [];
  const resizableColPositions = Arr.filter(colPositions, (_pos, i) => Arr.exists(resizableColBars, (barIndex) => i === barIndex ));
  refreshCol(wire, resizableColPositions, position, Height.getOuter(table));
};

const refresh = (wire: ResizeWire, table: SugarElement<HTMLTableElement>): void => {
  destroy(wire);
  if (wire.isResizable(table)) {
    const warehouse = Warehouse.fromTable(table);
    const rows = Blocks.rows(warehouse);
    const cols = Blocks.columns(warehouse);
    refreshGrid(warehouse, wire, table, rows, cols);
  }
};

const each = (wire: ResizeWire, f: (bar: SugarElement<HTMLDivElement>, idx: number) => void): void => {
  const bars = SelectorFilter.descendants<HTMLDivElement>(wire.parent(), '.' + resizeBar);
  Arr.each(bars, f);
};

const hide = (wire: ResizeWire): void => {
  each(wire, (bar) => {
    Css.set(bar, 'display', 'none');
  });
};

const show = (wire: ResizeWire): void => {
  each(wire, (bar) => {
    Css.set(bar, 'display', 'block');
  });
};

const isRowBar = (element: SugarElement<Node>): element is SugarElement<HTMLDivElement> => {
  return Class.has(element, resizeRowBar);
};

const isColBar = (element: SugarElement<Node>): element is SugarElement<HTMLDivElement> => {
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
