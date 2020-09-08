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

const refreshGrid = function (wire: ResizeWire, table: SugarElement, rows: Optional<SugarElement>[], cols: Optional<SugarElement>[]) {
  const position = SugarLocation.absolute(table);
  const rowPositions = rows.length > 0 ? BarPositions.height.positions(rows, table) : [];
  refreshRow(wire, rowPositions, position, Width.getOuter(table));

  const colPositions = cols.length > 0 ? BarPositions.width.positions(cols, table) : [];
  refreshCol(wire, colPositions, position, Height.getOuter(table));
};

const refresh = function (wire: ResizeWire, table: SugarElement) {
  destroy(wire);

  const warehouse = Warehouse.fromTable(table);
  const rows = Blocks.rows(warehouse);
  const cols = Blocks.columns(warehouse);

  refreshGrid(wire, table, rows, cols);
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
