import { afterEach, Assert, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFilter, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { ResizeWire } from 'ephox/snooker/api/ResizeWire';
import * as Bars from 'ephox/snooker/resize/Bars';

const resizeAttribute = 'data-snooker-resize';
const isResizable = (elm: SugarElement<Element>) => Attribute.get(elm, resizeAttribute) !== 'false';

const tableHtml = '<table style="width: 400px"><tbody><tr><td style="width: 200px"></td><td style="width: 200px"></td></tr></tbody></table>';
const colgroupTableHtml = '<table style="width: 400px"><colgroup><col style="width: 200px" /><col style="width: 200px" /></colgroup><tbody><tr><td></td><td></td></tr></tbody></table>';

const assertBarCounts = (scope: SugarElement<Node>, rows: number, cols: number) => {
  const rowBars = SelectorFilter.descendants(scope, 'div[data-row]');
  const colBars = SelectorFilter.descendants(scope, 'div[data-column]');
  Assert.eq(`Should be ${rows} row bar in the dom`, rows, rowBars.length);
  Assert.eq(`Should be ${cols} col bars in the dom`, cols, colBars.length);
};

const setResizeAttr = (scope: SugarElement<Node>, selector: string, value: string) => {
  const elm = SelectorFind.descendant(scope, selector).getOrDie(`Could not find ${selector}`);
  Attribute.set(elm, resizeAttribute, value);
};

const bddSetupTable = (html: string, siblingTablesHtml: string[] = []) => {
  let container: SugarElement<HTMLDivElement>;
  let table: SugarElement<HTMLTableElement>;

  beforeEach(() => {
    container = SugarElement.fromHtml<HTMLDivElement>('<div style="position: absolute; left: 0; top: 0; width: 500px"></div>');
    table = SugarElement.fromHtml<HTMLTableElement>(html);
    Insert.append(container, table);
    Arr.each(siblingTablesHtml, (siblingHtml) => Insert.append(container, SugarElement.fromHtml(siblingHtml)));
    Insert.append(SugarBody.body(), container);
  });

  afterEach(() => {
    Remove.remove(container);
  });

  return {
    container: () => container,
    table: () => table
  };
};

const assertRefreshAndDestroy = (
  container: SugarElement<HTMLDivElement>,
  table: SugarElement<HTMLTableElement>,
  resizeCallback: (elm: SugarElement<Element>) => boolean,
  rows: number,
  cols: number
) => {
  const wire = ResizeWire.only(table, resizeCallback);
  Bars.refresh(wire, table);
  assertBarCounts(container, rows, cols);
  Bars.destroy(wire);
  assertBarCounts(container, 0, 0);
};

describe('browser.snooker.BarsTest', () => {
  context('Bars.refresh and Bars.destroy with standard table', () => {
    const fixture = bddSetupTable(tableHtml, [ colgroupTableHtml ]);

    it('should add bars for every row and column when resize is allowed', () => {
      assertRefreshAndDestroy(fixture.container(), fixture.table(), Fun.always, 1, 2);
    });

    it('should not add any bars when the table has the resize false attribute', () => {
      setResizeAttr(fixture.container(), 'table', 'false');
      assertRefreshAndDestroy(fixture.container(), fixture.table(), isResizable, 0, 0);
    });

    it('should not add row bars when the tr has the resize false attribute', () => {
      setResizeAttr(fixture.container(), 'tr', 'false');
      assertRefreshAndDestroy(fixture.container(), fixture.table(), isResizable, 0, 2);
    });

    it('should not add a column bar when the td has the resize false attribute', () => {
      setResizeAttr(fixture.container(), 'td', 'false');
      assertRefreshAndDestroy(fixture.container(), fixture.table(), isResizable, 1, 1);
    });
  });

  context('Bars.refresh and Bars.destroy with colgroup table', () => {
    const fixture = bddSetupTable(colgroupTableHtml);

    it('should add bars for every row and column when resize is allowed', () => {
      assertRefreshAndDestroy(fixture.container(), fixture.table(), Fun.always, 1, 2);
    });

    it('should not add a column bar when the col has the resize false attribute', () => {
      setResizeAttr(fixture.container(), 'col', 'false');
      assertRefreshAndDestroy(fixture.container(), fixture.table(), isResizable, 1, 1);
    });

    it('should not add a column bar when the td has the resize false attribute', () => {
      setResizeAttr(fixture.container(), 'td', 'false');
      assertRefreshAndDestroy(fixture.container(), fixture.table(), isResizable, 1, 1);
    });
  });

  context('Bars.refresh accessibility', () => {
    const fixture = bddSetupTable(tableHtml);

    it('TINYMCE-14927: should create bars hidden from screen readers', () => {
      const table = fixture.table();
      const resizeAlwaysWire = ResizeWire.only(table, Fun.always);

      Bars.refresh(resizeAlwaysWire, table);
      const bars = SelectorFilter.descendants(fixture.container(), 'div[data-row], div[data-column]');
      Assert.eq('Should be 3 bars in the dom', 3, bars.length);
      Arr.each(bars, (bar) => {
        Assert.eq('Bar should be hidden from screen readers', 'true', Attribute.get(bar, 'aria-hidden'));
        Assert.eq('Bar should not rely on the presentation role', false, Attribute.has(bar, 'role'));
      });
      Bars.destroy(resizeAlwaysWire);
    });
  });

  // TODO: TINY-6641 - Test other functions from Bars.ts

  // it('Bars.show and Bars.hide', () => {});

  // it('Bars.isColBar and Bars.isRowBar', () => {});
});
