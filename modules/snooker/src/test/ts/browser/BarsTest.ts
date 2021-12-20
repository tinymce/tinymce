import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFilter, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { ResizeWire } from 'ephox/snooker/api/ResizeWire';
import * as Bars from 'ephox/snooker/resize/Bars';

const resizeAttribute = 'data-snooker-resize';
const isResizable = (elm: SugarElement<Element>) => Attribute.get(elm, resizeAttribute) !== 'false';

const tableHtml = '<table style="width: 400px"><tbody><tr><td style="width: 200px"></td><td style="width: 200px"></td></tr></tbody></table>';
const colgroupTableHtml = '<table style="width: 400px"><colgroup><col style="width: 200px" /><col style="width: 200px" /></colgroup><tbody><tr><td></td><td></td></tr></tbody></table>';

const assertdBarCounts = (scope: SugarElement<Node>, rows: number, cols: number) => {
  const rowBars = SelectorFilter.descendants(scope, 'div[data-row]');
  const colBars = SelectorFilter.descendants(scope, 'div[data-column]');
  Assert.eq(`Should be ${rows} row bar in the dom`, rows, rowBars.length);
  Assert.eq(`Should be ${cols} col bars in the dom`, cols, colBars.length);
};

const setResizeAttr = (scope: SugarElement<Node>, selector: string, value: string) => {
  const elm = SelectorFind.descendant(scope, selector).getOrDie(`Could not find ${selector}`);
  Attribute.set(elm, resizeAttribute, value);
};

UnitTest.test('Bars.refresh and Bars.destroy with standard table', () => {
  const container = SugarElement.fromHtml('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
  const table = SugarElement.fromHtml<HTMLTableElement>(tableHtml);
  const colgroupTable = SugarElement.fromHtml<HTMLTableElement>(colgroupTableHtml);
  Insert.append(container, table);
  Insert.append(container, colgroupTable);
  Insert.append(SugarBody.body(), container);

  const resizeAlwaysWire = ResizeWire.only(table, Fun.always);
  const resizeCallbackWire = ResizeWire.only(table, isResizable);

  // Test with resize allowed
  Bars.refresh(resizeAlwaysWire, table);
  assertdBarCounts(container, 1, 2);
  Bars.destroy(resizeAlwaysWire);
  assertdBarCounts(container, 0, 0);

  // Test with resize false atrribute on table
  setResizeAttr(container, 'table', 'false');
  Bars.refresh(resizeCallbackWire, table);
  assertdBarCounts(container, 0, 0);
  Bars.destroy(resizeCallbackWire);
  assertdBarCounts(container, 0, 0);
  setResizeAttr(container, 'table', 'true');

  // Test with resize false atrribute on tr
  setResizeAttr(container, 'tr', 'false');
  Bars.refresh(resizeCallbackWire, table);
  assertdBarCounts(container, 0, 2);
  Bars.destroy(resizeCallbackWire);
  assertdBarCounts(container, 0, 0);
  setResizeAttr(container, 'tr', 'true');

  // Test with resize false atrribute on td
  setResizeAttr(container, 'td', 'false');
  Bars.refresh(resizeCallbackWire, table);
  assertdBarCounts(container, 1, 1);
  Bars.destroy(resizeCallbackWire);
  assertdBarCounts(container, 0, 0);
  setResizeAttr(container, 'td', 'true');

  Remove.remove(container);
});

UnitTest.test('Bars.refresh and Bars.destroy with colgroup table', () => {
  const container = SugarElement.fromHtml('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
  const table = SugarElement.fromHtml<HTMLTableElement>(colgroupTableHtml);
  Insert.append(container, table);
  Insert.append(SugarBody.body(), container);

  const resizeAlwaysWire = ResizeWire.only(table, Fun.always);
  const resizeCallbackWire = ResizeWire.only(table, isResizable);

  // Test with resize allowed
  Bars.refresh(resizeAlwaysWire, table);
  assertdBarCounts(container, 1, 2);
  Bars.destroy(resizeAlwaysWire);
  assertdBarCounts(container, 0, 0);

  // Test with resize false attribute on col
  setResizeAttr(container, 'col', 'false');
  Bars.refresh(resizeCallbackWire, table);
  assertdBarCounts(container, 1, 1);
  Bars.destroy(resizeCallbackWire);
  assertdBarCounts(container, 0, 0);
  setResizeAttr(container, 'col', 'true');

  // Test with resize false attribute on td
  setResizeAttr(container, 'td', 'false');
  Bars.refresh(resizeCallbackWire, table);
  assertdBarCounts(container, 1, 1);
  Bars.destroy(resizeCallbackWire);
  assertdBarCounts(container, 0, 0);
  setResizeAttr(container, 'td', 'true');
});

// TODO: TINY-6641 - Test other functions from Bars.ts

// UnitTest.test('Bars.show and Bars.hide', () => {});

// UnitTest.test('Bars.isColBar and Bars.isRowBar', () => {});
