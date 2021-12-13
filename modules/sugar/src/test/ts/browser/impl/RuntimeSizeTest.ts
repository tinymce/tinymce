import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { assert } from 'chai';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as SelectorFilter from 'ephox/sugar/api/search/SelectorFilter';
import * as RuntimeSize from 'ephox/sugar/impl/RuntimeSize';

interface TableModel {
  readonly total: number;
  readonly rows: number;
  readonly cols: number;
  readonly cells: number[];
}

UnitTest.test('Runtime Size Test', () => {
  const random = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

  const getOuterHeight = (elm: SugarElement<HTMLElement>) => Math.round(elm.dom.getBoundingClientRect().height);
  const getOuterWidth = (elm: SugarElement<HTMLElement>) => Math.round(elm.dom.getBoundingClientRect().width);

  const measureCells = (getSize: (e: SugarElement<HTMLElement>) => number, table: SugarElement<HTMLElement>) =>
    Arr.map(SelectorFilter.descendants<HTMLTableCellElement>(table, 'td'), getSize);

  const measureTable = (table: SugarElement<HTMLElement>, getSize: (e: SugarElement<HTMLElement>) => number) => ({
    total: getSize(table),
    cells: measureCells(getSize, table)
  });

  const setHeight = (table: SugarElement<Node>, value: string) => Css.set(table, 'height', value);
  const setWidth = (table: SugarElement<Node>, value: string) => Css.set(table, 'width', value);

  const resizeTableBy = (table: SugarElement<HTMLElement>, setSize: (e: SugarElement<HTMLElement>, v: string) => void, tableInfo: { total: number; cells: number[] }, delta: number) => {
    setSize(table, '');
    Arr.map(SelectorFilter.descendants<HTMLTableCellElement>(table, 'td'), (cell, i) => {
      setSize(cell, (tableInfo.cells[i] + delta) + 'px');
    });
  };

  const assertSize = (s1: { total: number; cells: number[] }, table: SugarElement<HTMLElement>, getOuterSize: (e: SugarElement<HTMLElement>) => number, message: string) => {
    const s2 = measureTable(table, getOuterSize);
    const tableHtml = Html.getOuter(table);

    assert.equal(s1.total, s2.total, `${message}, expected table size: ${s1.total}, actual: ${s2.total}, table: ${tableHtml}`);

    Arr.each(s1.cells, (cz1, i) => {
      const cz2 = s2.cells[i];
      assert.equal(cz1, cz2, `${message}, expected cell size: ${cz1}, actual: ${cz2}, table: ${tableHtml}`);
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
    const table = SugarElement.fromTag('table');
    const tbody = SugarElement.fromTag('tbody');

    Attribute.set(table, 'border', '1');
    Attribute.set(table, 'cellpadding', random(0, 10).toString());
    Attribute.set(table, 'cellspacing', random(0, 10).toString());

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
      const row = SugarElement.fromTag('tr');

      Arr.range(cols, () => {
        const cell = SugarElement.fromTag('td');

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

        const content = SugarElement.fromTag('div');

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
    Insert.append(SugarBody.body(), table);

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

  const testTableSize = (
    createTable: (rows: number, cols: number) => SugarElement<HTMLElement>,
    getOuterSize: (e: SugarElement<HTMLElement>) => number,
    getSize: (e: SugarElement<HTMLElement>) => number,
    setSize: (e: SugarElement<HTMLElement>, v: string) => void,
    getTotalDelta: (model: TableModel, delta: number) => number
  ) => () => {
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
