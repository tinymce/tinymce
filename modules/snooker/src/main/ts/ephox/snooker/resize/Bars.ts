import { Arr, Option } from '@ephox/katamari';
import { Class, Css, Element, Height, Insert, Location, Position, Remove, SelectorFilter, Width } from '@ephox/sugar';
import { ResizeWire } from '../api/ResizeWire';
import * as Blocks from '../lookup/Blocks';
import { Warehouse } from '../model/Warehouse';
import * as Styles from '../style/Styles';
import * as Bar from './Bar';
import { BarPositions, ColInfo, RowInfo } from './BarPositions';

const resizeBar = Styles.resolve('resizer-bar');
const resizeRowBar = Styles.resolve('resizer-rows');
const resizeColBar = Styles.resolve('resizer-cols');
const BAR_THICKNESS = 7;

const destroy = function (wire: ResizeWire) {
  const previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(previous, Remove.remove);
};

const drawBar = function <T> (wire: ResizeWire, positions: Option<T>[], create: (origin: Position, info: T) => Element) {
  const origin = wire.origin();
  Arr.each(positions, function (cpOption) {
    cpOption.each(function (cp) {
      const bar = create(origin, cp);
      Class.add(bar, resizeBar);
      Insert.append(wire.parent(), bar);
    });
  });
};

const refreshCol = function (wire: ResizeWire, colPositions: Option<ColInfo>[], position: Position, tableHeight: number) {
  drawBar(wire, colPositions, function (origin, cp) {
    const colBar = Bar.col(cp.col, cp.x - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
    Class.add(colBar, resizeColBar);
    return colBar;
  });
};

const refreshRow = function (wire: ResizeWire, rowPositions: Option<RowInfo>[], position: Position, tableWidth: number) {
  drawBar(wire, rowPositions, function (origin, cp) {
    const rowBar = Bar.row(cp.row, position.left() - origin.left(), cp.y - origin.top(), tableWidth, BAR_THICKNESS);
    Class.add(rowBar, resizeRowBar);
    return rowBar;
  });
};

const refreshGrid = function (wire: ResizeWire, table: Element, rows: Option<Element>[], cols: Option<Element>[], hdirection: BarPositions<RowInfo>, vdirection: BarPositions<ColInfo>) {
  const position = Location.absolute(table);
  const rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
  refreshRow(wire, rowPositions, position, Width.getOuter(table));

  const colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
  refreshCol(wire, colPositions, position, Height.getOuter(table));
};

const refresh = function (wire: ResizeWire, table: Element, hdirection: BarPositions<RowInfo>, vdirection: BarPositions<ColInfo>) {
  destroy(wire);

  const warehouse = Warehouse.fromTable(table);
  const rows = Blocks.rows(warehouse);
  const cols = Blocks.columns(warehouse);

  refreshGrid(wire, table, rows, cols, hdirection, vdirection);
};

const each = function (wire: ResizeWire, f: (bar: Element, idx: number) => void) {
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

const isRowBar = function (element: Element) {
  return Class.has(element, resizeRowBar);
};

const isColBar = function (element: Element) {
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
