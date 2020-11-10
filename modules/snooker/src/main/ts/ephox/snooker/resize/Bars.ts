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

// const canResizeRow = (table: SugarElement<HTMLTableElement>, rowIndex: number, canResize: (elm: SugarElement<Element>) => boolean) => {
//   const warehouse = Warehouse.fromTable(table);
//   const rowOpt = Optional.from(warehouse.all[rowIndex]);
//   const editableRow = rowOpt.map((row) => row.element).forall(canResize);
//   const editableCells = rowOpt.map((row) => row.cells).forall((cells) => Arr.forall(cells, (cell) => canResize(cell.element)));
//   return editableRow && editableCells;
// };

// // Should I also check colgroup element if it exists?
// const canResizeColumn = (table: SugarElement<HTMLTableElement>, columnIndex: number, canResize: (elm: SugarElement<Element>) => boolean) => {
//   const warehouse = Warehouse.fromTable(table);
//   // const editableCol = Warehouse.getColumnAt(warehouse, columnIndex).map((col) => col.element).forall(canResize);
//   const editableCol = Warehouse.getColumnAt(warehouse, columnIndex).map((col) => col.element).forall(canResize);
//   const columnCells = Warehouse.filterItems(warehouse, (cell) => cell.column === columnIndex);
//   const editableCells = Arr.forall(columnCells, (cell) => canResize(cell.element));
//   return editableCol && editableCells;
// };

const destroy = function (wire: ResizeWire) {
  const previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(previous, Remove.remove);
};

const drawBar = function <T> (wire: ResizeWire, positions: Optional<T>[], create: (origin: SugarPosition, info: T) => SugarElement | null) {
  const origin = wire.origin();
  Arr.each(positions, function (cpOption) {
    cpOption.each(function (cp) {
      const bar = create(origin, cp);
      if (bar !== null) {
        Class.add(bar, resizeBar);
        Insert.append(wire.parent(), bar);
      }
    });
  });
};

const refreshCol = function (wire: ResizeWire, colPositions: Optional<BarPositions.ColInfo>[], position: SugarPosition, tableHeight: number, ignore: number[]) {
  drawBar(wire, colPositions, function (origin, cp) {
    // Maybe instead of just not including the class, don't render it at all
    if (Arr.forall(ignore, (ignoreIndex) => ignoreIndex !== cp.col)) {
      const colBar = Bar.col(cp.col, cp.x - origin.left, position.top - origin.top, BAR_THICKNESS, tableHeight);
      Class.add(colBar, resizeColBar);
      return colBar;
    } else {
      return null;
    }
  });
};

const refreshRow = function (wire: ResizeWire, rowPositions: Optional<BarPositions.RowInfo>[], position: SugarPosition, tableWidth: number) {
  drawBar(wire, rowPositions, function (origin, cp) {
    const rowBar = Bar.row(cp.row, position.left - origin.left, cp.y - origin.top, tableWidth, BAR_THICKNESS);
    Class.add(rowBar, resizeRowBar);
    return rowBar;
  });
};

const refreshGrid = function (wire: ResizeWire, table: SugarElement, rows: Optional<SugarElement>[], cols: Optional<SugarElement>[], ignore?: Ignore) {
  const position = SugarLocation.absolute(table);
  const rowPositions = rows.length > 0 ? BarPositions.height.positions(rows, table) : [];
  refreshRow(wire, rowPositions, position, Width.getOuter(table));

  // Filter colPositions
  const colPositions = cols.length > 0 ? BarPositions.width.positions(cols, table) : [];
  refreshCol(wire, colPositions, position, Height.getOuter(table), ignore?.columns || []);
};

// Could I have an extra parameter to specify if any cols or rows should be ignored?
interface Ignore {
  rows: number[];
  columns: number[];
}

const refresh = function (wire: ResizeWire, table: SugarElement, ignore?: Ignore) {
  destroy(wire);

  const warehouse = Warehouse.fromTable(table);
  Warehouse.findItem(warehouse, );
  const rows = Blocks.rows(warehouse);
  const cols = Blocks.columns(warehouse);

  // How do I check/know which bar was hovered over?
  // Need that to get the column index so I check those cells and see if they are resizable

  refreshGrid(wire, table, rows, cols, ignore);
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
