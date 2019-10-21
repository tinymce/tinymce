import { assert, UnitTest, TestLabel } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Body, Css, Element, Html, Insert, Remove, SelectorFilter } from '@ephox/sugar';
import RuntimeSize from 'ephox/snooker/resize/RuntimeSize';

UnitTest.test('Runtime Size Test', function () {
  const platform = PlatformDetection.detect();

  const random = function (min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
  };

  const getOuterWidth = function (elm: Element) {
    return Math.round(elm.dom().getBoundingClientRect().width);
  };

  const getOuterHeight = function (elm: Element) {
    return Math.round(elm.dom().getBoundingClientRect().height);
  };

  const measureCells = function (getSize: (e: Element) => number, table: Element) {
    return Arr.map(SelectorFilter.descendants(table, 'td'), getSize);
  };

  const measureTable = function (table: Element, getSize: (e: Element) => number) {
    return {
      total: getSize(table),
      cells: measureCells(getSize, table)
    };
  };

  const setWidth = function (table: Element, value: string) {
    Css.set(table, 'width', value);
  };

  const setHeight = function (table: Element, value: string) {
    Css.set(table, 'height', value);
  };

  const resizeTableBy = function (table: Element, setSize: (e: Element, v: string) => void, tableInfo: { total: number, cells: number[] }, delta: number) {
    setSize(table, '');
    Arr.map(SelectorFilter.descendants(table, 'td'), function (cell, i) {
      setSize(cell, (tableInfo.cells[i] + delta) + 'px');
    });
  };

  const fuzzyAssertEq = function (a: number, b: number, msg: TestLabel) {
    // Sometimes the widths of the cells are 1 px off due to rounding but the total table width is never off
    assert.eq(true, Math.abs(a - b) <= 1, msg);
  };

  const assertSize = function (s1: { total: number, cells: number[] }, table: Element, getOuterSize: (e: Element) => number, message: string) {
    const s2 = measureTable(table, getOuterSize);
    const cellAssertEq = platform.browser.isIE() || platform.browser.isEdge() ? fuzzyAssertEq : assert.eq;

    assert.eq(s1.total, s2.total, () => message + ', expected table size: ' + s1.total + ', actual: ' + s2.total + ', table: ' + Html.getOuter(table));

    Arr.each(s1.cells, function (cz1, i) {
      const cz2 = s2.cells[i];
      cellAssertEq(cz1, cz2, () => message + ', expected cell size: ' + cz1 + ', actual: ' + cz2 + ', table: ' + Html.getOuter(table));
    });
  };

  const randomValue = function <T> (values: T[]) {
    const idx = random(0, values.length - 1);
    return values[idx];
  };

  const randomSize = function (min: number, max: number) {
    const n = random(min, max);
    return n > 0 ? n + 'px' : '0';
  };

  const randomBorder = function (min: number, max: number, color: string) {
    const n = random(min, max);
    return n > 0 ? n + 'px solid ' + color : '0';
  };

  const createTableH = function () {
    const table = Element.fromTag('table');
    const tbody = Element.fromTag('tbody');
    const tr = Element.fromTag('tr');

    Attr.set(table, 'border', '1');
    Attr.set(table, 'cellpadding', random(0, 10).toString());
    Attr.set(table, 'cellspacing', random(0, 10).toString());

    Css.setAll(table, {
      'border-collapse': randomValue(['collapse', 'separate']),
      'border-left': randomBorder(0, 5, 'red'),
      'border-right': randomBorder(0, 5, 'red'),
      'width': randomSize(100, 1000)
    });

    const cells = Arr.range(random(1, 5), function (_) {
      const cell = Element.fromTag('td');

      Css.setAll(cell, {
        'width': randomSize(1, 100),
        'height': '10px',
        'padding-left': randomSize(0, 5),
        'padding-right': randomSize(0, 5),
        'border-left': randomBorder(0, 5, 'green'),
        'border-right': randomBorder(0, 5, 'green')
      });

      const content = Element.fromTag('div');

      Css.setAll(content, {
        width: randomSize(1, 200),
        height: '10px'
      });

      Insert.append(cell, content);

      return cell;
    });

    Insert.append(table, tbody);
    Insert.append(tbody, tr);

    Arr.each(cells, function (cell) {
      Insert.append(tr, cell);
    });

    Insert.append(Body.body(), table);

    return table;
  };

  const createTableV = function () {
    const table = Element.fromTag('table');
    const tbody = Element.fromTag('tbody');

    Attr.set(table, 'border', '1');
    Attr.set(table, 'cellpadding', random(0, 10).toString());
    Attr.set(table, 'cellspacing', random(0, 10).toString());

    Css.setAll(table, {
      'border-collapse': randomValue(['collapse', 'separate']),
      'border-top': randomBorder(0, 5, 'red'),
      'border-bottom': randomBorder(0, 5, 'red'),
      'height': randomSize(100, 1000)
    });

    const rows = Arr.range(random(1, 5), function (_) {
      const row = Element.fromTag('tr');
      const cell = Element.fromTag('td');

      Css.setAll(cell, {
        'width': '10px',
        'height': randomSize(1, 100),
        'box-sizing': randomValue(['content-box', 'border-box']),
        'padding-top': randomSize(0, 5),
        'padding-bottom': randomSize(0, 5),
        'border-top': randomBorder(0, 5, 'green'),
        'border-bottom': randomBorder(0, 5, 'green')
      });

      const content = Element.fromTag('div');

      Css.setAll(content, {
        width: '10px',
        height: randomSize(1, 200)
      });

      Insert.append(cell, content);
      Insert.append(row, cell);

      return row;
    });

    Insert.append(table, tbody);

    Arr.each(rows, function (row) {
      Insert.append(tbody, row);
    });

    Insert.append(Body.body(), table);

    return table;
  };

  const resizeModel = function (size: { total: number, cells: number[] }, delta: number) {
    const deltaTotal = delta * size.cells.length;
    const cells = Arr.map(size.cells, function (cz) {
      return cz + delta;
    });

    return {
      total: size.total + deltaTotal,
      cells
    };
  };

  const testTableSize = function (createTable: () => Element, getOuterSize: (e: Element) => number, getSize: (e: Element) => number, setSize: (e: Element, v: string) => void) {
    return function (n: any) {
      const table = createTable();
      const beforeSize = measureTable(table, getOuterSize);

      resizeTableBy(table, setSize, measureTable(table, getSize), 0);
      assertSize(beforeSize, table, getOuterSize, 'Should be unchanged in size');

      resizeTableBy(table, setSize, measureTable(table, getSize), 10);
      assertSize(resizeModel(beforeSize, 10), table, getOuterSize, 'Should be changed by 10 size');

      Remove.remove(table);
    };
  };

  const generateTest = function (generator: (n: number) => void, n: number) {
    Arr.each(Arr.range(n, Fun.identity), generator);
  };

  generateTest(testTableSize(createTableH, getOuterWidth, RuntimeSize.getWidth, setWidth), 50);
  generateTest(testTableSize(createTableV, getOuterHeight, RuntimeSize.getHeight, setHeight), 50);
});
