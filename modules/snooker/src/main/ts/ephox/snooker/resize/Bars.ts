import { Arr } from '@ephox/katamari';
import { Class, Css, Height, Insert, Location, Remove, SelectorFilter, Width } from '@ephox/sugar';
import Blocks from '../lookup/Blocks';
import DetailsList from '../model/DetailsList';
import Warehouse from '../model/Warehouse';
import Styles from '../style/Styles';
import Bar from './Bar';

const resizeBar = Styles.resolve('resizer-bar');
const resizeRowBar = Styles.resolve('resizer-rows');
const resizeColBar = Styles.resolve('resizer-cols');
const BAR_THICKNESS = 7;

const clear = function (wire) {
  const previous = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(previous, Remove.remove);
};

const drawBar = function (wire, positions, create) {
  const origin = wire.origin();
  Arr.each(positions, function (cpOption, i) {
    cpOption.each(function (cp) {
      const bar = create(origin, cp);
      Class.add(bar, resizeBar);
      Insert.append(wire.parent(), bar);
    });
  });
};

const refreshCol = function (wire, colPositions, position, tableHeight) {
  drawBar(wire, colPositions, function (origin, cp) {
    const colBar = Bar.col(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
    Class.add(colBar, resizeColBar);
    return colBar;
  });
};

const refreshRow = function (wire, rowPositions, position, tableWidth) {
  drawBar(wire, rowPositions, function (origin, cp) {
    const rowBar = Bar.row(cp.row(), position.left() - origin.left(), cp.y() - origin.top(), tableWidth, BAR_THICKNESS);
    Class.add(rowBar, resizeRowBar);
    return rowBar;
  });
};

const refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
  const position = Location.absolute(table);
  const rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
  refreshRow(wire, rowPositions, position, Width.getOuter(table));

  const colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
  refreshCol(wire, colPositions, position, Height.getOuter(table));
};

const refresh = function (wire, table, hdirection, vdirection) {
  clear(wire);

  const list = DetailsList.fromTable(table);
  const warehouse = Warehouse.generate(list);
  const rows = Blocks.rows(warehouse);
  const cols = Blocks.columns(warehouse);

  refreshGrid(wire, table, rows, cols, hdirection, vdirection);
};

const each = function (wire, f) {
  const bars = SelectorFilter.descendants(wire.parent(), '.' + resizeBar);
  Arr.each(bars, f);
};

const hide = function (wire) {
  each(wire, function (bar) {
    Css.set(bar, 'display', 'none');
  });
};

const show = function (wire) {
  each(wire, function (bar) {
    Css.set(bar, 'display', 'block');
  });
};

const isRowBar = function (element) {
  return Class.has(element, resizeRowBar);
};

const isColBar = function (element) {
  return Class.has(element, resizeColBar);
};

export default {
  refresh,
  hide,
  show,
  destroy: clear,
  isRowBar,
  isColBar
};