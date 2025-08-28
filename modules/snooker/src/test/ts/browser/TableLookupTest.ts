import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Compare, Insert, Remove, SelectorFilter, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import * as TableLookup from 'ephox/snooker/api/TableLookup';

const testWithSelector = (html: string, selector: string, assert: (element: SugarElement<Element>) => void) => {
  const element = SugarElement.fromHtml(html);
  Insert.append(SugarBody.body(), element);

  SelectorFind.descendant(SugarBody.body(), selector).fold(() => {
    Assert.fail('Could not find anything with ' + selector);
  }, (triggerElement) => {
    assert(triggerElement);
    Remove.remove(element);
  });
};

UnitTest.test('TableLookupTest - cells', () => {
  const testerFound = (html: string, triggerSelector: string, resultSelector: string, label: string) => {
    testWithSelector(html, triggerSelector, (triggerElement) => {
      const result = TableLookup.cell(triggerElement);
      Assert.eq(label + ': Expected the result to find something', true, result.isSome());
      const expectedElement = SelectorFilter.descendants(SugarBody.body(), resultSelector);
      Assert.eq(label + ': Expected to find only one element in the DOM with the selector ' + resultSelector + ' found: ' + expectedElement.length, true, expectedElement.length === 1);
      Assert.eq(label + ': The result and the expectation should be the same element', true, Compare.eq(expectedElement[0], result.getOrDie()));
    });
  };

  const testerShouldNotFind = (html: string, selector: string, label: string) => {
    testWithSelector(html, selector, (triggerElement) => {
      const result = TableLookup.cell(triggerElement);
      Assert.eq(label + ': Expected the result to find nothing', false, result.isSome());
    });
  };

  const html =
  '<table style="border-collapse: collapse; width: 1088px; float: none; height: 60px;" summary="Skin burns" border="1">' +
  '<caption>Outer table<br></caption>' +
  '<tbody>' +
  '<tr style="height: 20px;">' +
  '<td style="width: 242px; height: 20px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '<td style="height: 60px; width: 815px;">' +
  '<table style="border-collapse: collapse; width: 400px; float: none; height: 200px;" border="1">' +
  '<caption>Inner table</caption>' +
  '<tbody>' +
  '<tr style="height: 0px;">' +
  '<td style="width: 399px; height: 0px;" colspan="3" rowspan="3">' +
  '<span class="ephox-cram-annotation-wrap ephox-cram_4309642597121480569760068" ' +
  'aria-invalid="spelling" data-ephox-cram-highlight-id="ephox-cram_4309642597121480569760068" ' +
  'data-ephox-cram-annotation="eee" data-ephox-cram-lingo="en_us">eee</span>' +
  '</td>' +
  '</tr>' +
  '<tr style="height: 0px;"></tr>' +
  '<tr></tr>' +
  '</tbody>' +
  '</table>' +
  '<br>' +
  '</td>' +
  '<td style="width: 11px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '</tr>' +
  '<tr style="height: 20px;">' +
  '<td style="width: 242px; height: 20px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '<td style="width: 815px;"><br></td>' +
  '<td style="width: 11px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '</tr>' +
  '<tr style="height: 20px;">' +
  '<td style="width: 242px; height: 20px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '<td style="width: 815px;"><br></td>' +
  '<td style="width: 11px;"><br></td>' +
  '<td style="width: 10px; height: 20px;"><br></td>' +
  '</tr>' +
  '</tbody>' +
  '</table>';

  const testTableRoWClick = () => {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3) > table > tbody > tr:nth-child(1)';
    testerShouldNotFind(html, triggerSelector, 'testTableRoWClick');
  };

  const testOuterTableCellClick = () => {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3)';
    const resultSelector = triggerSelector;
    testerFound(html, triggerSelector, resultSelector, 'testOuterTableCellClick');
  };

  const testInnerTableCaptionClick = () => {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3) > table > caption';
    testerShouldNotFind(html, triggerSelector, 'testInnerTableCaptionClick');
  };

  const testOuterTableCaptionClick = () => {
    const triggerSelector = 'body > table > caption';
    testerShouldNotFind(html, triggerSelector, 'testOuterTableCaptionClick');
  };

  const testOuterTableMergedRowClick = () => {
    const triggerSelector = 'body > table > tbody > tr:nth-child(3)';
    testerShouldNotFind(html, triggerSelector, 'testOuterTableMergedRowClick');
  };

  const testOuterTableMergedCellClick = () => {
    const triggerSelector = 'body > table > tbody > tr:nth-child(3) > td:nth-child(1)';
    const resultSelector = triggerSelector;
    testerFound(html, triggerSelector, resultSelector, 'testOuterTableMergedCellClick');
  };

  const testOuterTableMergedCaptionClick = () => {
    const triggerSelector = 'body > table > caption';
    testerShouldNotFind(html, triggerSelector, 'testOuterTableMergedCaptionClick');
  };

  const testCellShouldAlwaysReturnTheSameCell = (label: string) => {

    const element = SugarElement.fromHtml(html);
    Insert.append(SugarBody.body(), element);

    const cells = SelectorFilter.descendants(SugarBody.body(), 'td');
    if (cells.length === 0) {
      Assert.fail('Could not find any table cell element');
    } else {
      Arr.each(cells, (cell) => {
        const result = TableLookup.cell(cell);
        Assert.eq(label + ': Expected the result to find something', true, result.isSome());
        Assert.eq(label + ': The result and the expectation should be the same element', true, Compare.eq(cell, result.getOrDie()));
      });

      Remove.remove(element);
    }
  };

  const testRowShouldNotReturn = (label: string) => {

    const element = SugarElement.fromHtml(html);
    Insert.append(SugarBody.body(), element);

    const rows = SelectorFilter.descendants(SugarBody.body(), 'tr');
    if (rows.length === 0) {
      Assert.fail('Could not find any table row elements');
    } else {
      Arr.each(rows, (row) => {
        const result = TableLookup.cell(row);
        Assert.eq(label + ': Expected the result to find nothing', false, result.isSome());
      });
      Remove.remove(element);
    }
  };

  testTableRoWClick();
  testOuterTableCellClick();
  testInnerTableCaptionClick();
  testOuterTableCaptionClick();
  testOuterTableMergedRowClick();
  testOuterTableMergedCellClick();
  testOuterTableMergedCaptionClick();
  testCellShouldAlwaysReturnTheSameCell('Testing cells');
  testRowShouldNotReturn('Testing rows');
});

UnitTest.test('TableLookupTest - columns', () => {
  const html = '<table>' +
    '<caption>Outer table</caption>' +
    '<colgroup><col><col></colgroup>' +
    '<tbody>' +
    '<tr>' +
    '<td><table>' +
    '<caption>Inner table</caption>' +
    '<colgroup><col></colgroup>' +
    '<colgroup></colgroup>' +
    '<tbody>' +
    '<tr><td>A</td><td>B</td></tr>' +
    '</tbody>' +
    '</table></td>' +
    '<td>C</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>';

  const testColumnGroup = (label: string, triggerSelector: string, expectedCount: number) => {
    testWithSelector(html, triggerSelector, (triggerElement) => {
      const columnGroups = TableLookup.columnGroups(triggerElement);
      Assert.eq(label, expectedCount, columnGroups.length);
    });
  };

  const testColumn = (label: string, triggerSelector: string, expectedCount: number) => {
    testWithSelector(html, triggerSelector, (triggerElement) => {
      const columns = TableLookup.columns(triggerElement);
      Assert.eq(label, expectedCount, columns.length);
    });
  };

  const testDetachedColumn = (label: string, triggerSelector: string, expectedCount: number) => {
    testWithSelector(html, triggerSelector, (triggerElement) => {
      Remove.remove(triggerElement);
      const columns = TableLookup.columns(triggerElement);
      Assert.eq(label, expectedCount, columns.length);
    });
  };

  testColumnGroup('Column group from table', 'body > table', 1);
  testColumnGroup('Column group from table cell', 'body > table > tbody > tr > td', 1);
  testColumnGroup('Column group from nested table', 'body > table > tbody > tr > td:nth-child(1) > table', 2);
  testColumnGroup('Column group from nested table cell ', 'body > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td', 2);

  testColumn('Column from table', 'body > table', 2);
  testColumn('Column from table colgroup', 'body > table > colgroup', 2);
  testColumn('Column from table cell', 'body > table > tbody > tr > td', 2);
  testColumn('Column from nested table', 'body > table > tbody > tr > td:nth-child(1) > table', 1);
  testColumn('Column from nested table colgroup', 'body > table > tbody > tr > td:nth-child(1) > table > colgroup', 1);
  testColumn('Column from nested table cell ', 'body > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td', 1);

  testDetachedColumn('Column from detached table colgroup', 'body > table > colgroup', 2);
});
