import { assert, TestLabel, UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Body, Css, Element, Html, Insert, InsertAll, Remove, SelectorFilter } from '@ephox/sugar';
import * as RuntimeSize from 'ephox/snooker/resize/RuntimeSize';

interface TableModel {
  total: number;
  rows: number;
  cols: number;
  cells: number[];
}

UnitTest.test('Runtime Size Test', () => {
  const platform = PlatformDetection.detect();

  const random = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

  const getOuterHeight = (elm: Element) => Math.round(elm.dom().getBoundingClientRect().height);
  const getOuterWidth = (elm: Element) => Math.round(elm.dom().getBoundingClientRect().width);

  const measureCells = (getSize: (e: Element) => number, table: Element) => Arr.map(SelectorFilter.descendants(table, 'td'), getSize);

  const measureTable = (table: Element, getSize: (e: Element) => number) => ({
    total: getSize(table),
    cells: measureCells(getSize, table)
  });

  const setHeight = (table: Element, value: string) => Css.set(table, 'height', value);
  const setWidth = (table: Element, value: string) => Css.set(table, 'width', value);

  const resizeTableBy = (table: Element, setSize: (e: Element, v: string) => void, tableInfo: { total: number; cells: number[] }, delta: number) => {
    setSize(table, '');
    Arr.map(SelectorFilter.descendants(table, 'td'), (cell, i) => {
      setSize(cell, (tableInfo.cells[i] + delta) + 'px');
    });
  };

  const fuzzyAssertEq = (a: number, b: number, msg: TestLabel) => {
    // Sometimes the widths of the cells are 1 px off due to rounding but the total table width is never off
    assert.eq(true, Math.abs(a - b) <= 1, msg);
  };

  const assertSize = (s1: { total: number; cells: number[] }, table: Element, getOuterSize: (e: Element) => number, message: string) => {
    const s2 = measureTable(table, getOuterSize);
    const cellAssertEq = platform.browser.isIE() || platform.browser.isEdge() ? fuzzyAssertEq : assert.eq;

    assert.eq(s1.total, s2.total, () => message + ', expected table size: ' + s1.total + ', actual: ' + s2.total + ', table: ' + Html.getOuter(table));

    Arr.each(s1.cells, (cz1, i) => {
      const cz2 = s2.cells[i];
      cellAssertEq(cz1, cz2, () => message + ', expected cell size: ' + cz1 + ', actual: ' + cz2 + ', table: ' + Html.getOuter(table));
    });
  };

  const randomValue = <T>(values: T[]) => {
    const idx = random(0, values.length - 1);
    return values[idx];
  };

  const randomSize = (min: number, max: number) => {
    const n = random(min, max);
    return n > 0 ? n + 'px' : '0';
  };

  const randomBorder = (min: number, max: number, color: string) => {
    const n = random(min, max);
    return n > 0 ? n + 'px solid ' + color : '0';
  };

  const createTable = (rows: number, cols: number) => {
    const table = Element.fromTag('table');
    const tbody = Element.fromTag('tbody');

    Attr.set(table, 'border', '1');
    Attr.set(table, 'cellpadding', random(0, 10).toString());
    Attr.set(table, 'cellspacing', random(0, 10).toString());

    Css.setAll(table, {
      'border-collapse': randomValue([ 'collapse', 'separate' ]),
      'border-top': randomBorder(0, 5, 'red'),
      'border-left': randomBorder(0, 5, 'red'),
      'border-bottom': randomBorder(0, 5, 'red'),
      'border-right': randomBorder(0, 5, 'red'),
      'height': randomSize(100, 1000),
      'width': randomSize(100, 1000)
    });

    const rowElms = Arr.range(rows, () => {
      const row = Element.fromTag('tr');

      Arr.range(cols, () => {
        const cell = Element.fromTag('td');

        Css.setAll(cell, {
          'width': randomSize(1, 100),
          'height': randomSize(1, 100),
          'box-sizing': randomValue([ 'content-box', 'border-box' ]),
          'padding-top': randomSize(0, 5),
          'padding-left': randomSize(0, 5),
          'padding-bottom': randomSize(0, 5),
          'padding-right': randomSize(0, 5),
          'border-top': randomBorder(0, 5, 'green'),
          'border-left': randomBorder(0, 5, 'green'),
          'border-bottom': randomBorder(0, 5, 'green'),
          'border-right': randomBorder(0, 5, 'green')
        });

        const content = Element.fromTag('div');

        Css.setAll(content, {
          width: '10px',
          height: randomSize(1, 200)
        });

        Insert.append(cell, content);
        Insert.append(row, cell);
      });

      return row;
    });

    Insert.append(table, tbody);
    InsertAll.append(tbody, rowElms);
    Insert.append(Body.body(), table);

    return table;
  };

  const resizeModel = (model: TableModel, delta: number, getTotalDelta: (model: TableModel, delta: number) => number) => {
    const deltaTotal = getTotalDelta(model, delta);
    const cells = Arr.map(model.cells, (cz) => cz + delta);

    return {
      total: model.total + deltaTotal,
      cells
    };
  };

  const getHeightDelta = (model: TableModel, delta: number) => model.rows * delta;
  const getWidthDelta = (model: TableModel, delta: number) => model.cols * delta;

  const testTableSize = (createTable: (rows: number, cols: number) => Element, getOuterSize: (e: Element) => number, getSize: (e: Element) => number,
                         setSize: (e: Element, v: string) => void, getTotalDelta: (model: TableModel, delta: number) => number) => () => {
    const rows = random(1, 5);
    const cols = random(1, 5);

    const table = createTable(rows, cols);
    const beforeSize = {
      ...measureTable(table, getOuterSize),
      rows,
      cols
    };

    resizeTableBy(table, setSize, measureTable(table, getSize), 0);
    assertSize(beforeSize, table, getOuterSize, 'Should be unchanged in size');

    resizeTableBy(table, setSize, measureTable(table, getSize), 10);
    assertSize(resizeModel(beforeSize, 10, getTotalDelta), table, getOuterSize, 'Should be changed by 10 size');

    Remove.remove(table);
  };

  const generateTest = (generator: (n: number) => void, n: number) => Arr.each(Arr.range(n, Fun.identity), generator);

  generateTest(testTableSize(createTable, getOuterHeight, RuntimeSize.getHeight, setHeight, getHeightDelta), 50);
  generateTest(testTableSize(createTable, getOuterWidth, RuntimeSize.getWidth, setWidth, getWidthDelta), 50);
});
