import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Body, Compare, Element, Insert, Remove, SelectorFilter, SelectorFind } from '@ephox/sugar';
import TableLookup from 'ephox/snooker/api/TableLookup';

UnitTest.test('TableLookupTest', function () {
  const testerFound = function (html: string, triggerSelector: string, resultSelector: string, label: string) {
    const element = Element.fromHtml(html);
    Insert.append(Body.body(), element);

    SelectorFind.descendant(Body.body(), triggerSelector).fold(function () {
        assert.fail('Could not find anything with ' + triggerSelector);
      }, function (triggerElement) {
        const result = TableLookup.cell(triggerElement);
        assert.eq(true, result.isSome(), label + ': Expected the result to find something');
        const expectedElement = SelectorFilter.descendants(Body.body(), resultSelector);
        assert.eq(true, expectedElement.length === 1, label + ': Expected to find only one element in the DOM with the selector ' + resultSelector + ' found: ' + expectedElement.length);
        assert.eq(true, Compare.eq(expectedElement[0], result.getOrDie()), label + ': The result and the expectation should be the same element');
        Remove.remove(element);
    });
  };

  const testerShouldNotFind = function (html: string, selector: string, label: string) {
    const element = Element.fromHtml(html);
    Insert.append(Body.body(), element);

    SelectorFind.descendant(Body.body(), selector).fold(function () {
        assert.fail('Could not find anything with ' + selector);
      }, function (triggerElement) {
        const result = TableLookup.cell(triggerElement);
        assert.eq(false, result.isSome(), label + ': Expected the result to find nothing');
        Remove.remove(element);
    });
  };

  const htmlA = '<table style="border-collapse: collapse; width: 1088px; float: none; height: 60px;" summary="Skin burns" border="1"><caption>Outer table<br></caption><tbody><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="height: 60px; width: 815px;"><table style="border-collapse: collapse; width: 400px; float: none; height: 200px;" border="1"><caption>Inner table</caption><tbody><tr style="height: 0px;"><td style="width: 399px; height: 0px;" colspan="3" rowspan="3"><span class="ephox-cram-annotation-wrap ephox-cram_4309642597121480569760068" aria-invalid="spelling" data-ephox-cram-highlight-id="ephox-cram_4309642597121480569760068" data-ephox-cram-annotation="eee" data-ephox-cram-lingo="en_us">eee</span></td></tr><tr style="height: 0px;"></tr><tr></tr></tbody></table><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="width: 815px;"><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="width: 815px;"><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr></tbody></table>';
  const testTableRoWClick = function () {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3) > table > tbody > tr:nth-child(1)';
    testerShouldNotFind(htmlA, triggerSelector, 'testTableRoWClick');
  };

  const testOuterTableCellClick = function () {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3)';
    const resultSelector = triggerSelector;
    testerFound(htmlA, triggerSelector, resultSelector, 'testOuterTableCellClick');
  };

  const testInnerTableCaptionClick = function () {
    const triggerSelector = 'table > tbody > tr:nth-child(1) > td:nth-child(3) > table > caption';
    testerShouldNotFind(htmlA, triggerSelector, 'testInnerTableCaptionClick');
  };

  const testOuterTableCaptionClick = function () {
    const triggerSelector = 'body > table > caption';
    testerShouldNotFind(htmlA, triggerSelector, 'testOuterTableCaptionClick');
  };

  const htmlB = '<table style="border-collapse: collapse; width: 1088px; float: none; height: 60px;" summary="Skin burns" border="1"><caption>Outer table<br></caption><tbody><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="height: 60px; width: 815px;"><table style="border-collapse: collapse; width: 400px; float: none; height: 200px;" border="1"><caption>Inner table</caption><tbody><tr style="height: 0px;"><td style="width: 399px; height: 0px;" colspan="3" rowspan="3"><span class="ephox-cram-annotation-wrap ephox-cram_4309642597121480569760068" aria-invalid="spelling" data-ephox-cram-highlight-id="ephox-cram_4309642597121480569760068" data-ephox-cram-annotation="eee" data-ephox-cram-lingo="en_us">eee</span></td></tr><tr style="height: 0px;"></tr><tr></tr></tbody></table><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="width: 815px;"><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr><tr style="height: 20px;"><td style="width: 242px; height: 20px;"><br></td><td style="width: 10px; height: 20px;"><br></td><td style="width: 815px;"><br></td><td style="width: 11px;"><br></td><td style="width: 10px; height: 20px;"><br></td></tr></tbody></table>';
  const testOuterTableMergedRowClick = function () {
    const triggerSelector = 'body > table > tbody > tr:nth-child(3)';
    testerShouldNotFind(htmlB, triggerSelector, 'testOuterTableMergedRowClick');
  };

  const testOuterTableMergedCellClick = function () {
    const triggerSelector = 'body > table > tbody > tr:nth-child(3) > td:nth-child(1)';
    const resultSelector =  triggerSelector;
    testerFound(htmlB, triggerSelector, resultSelector, 'testOuterTableMergedCellClick');
  };

  const testOuterTableMergedCaptionClick = function () {
    const triggerSelector = 'body > table > caption';
    testerShouldNotFind(htmlB, triggerSelector, 'testOuterTableMergedCaptionClick');
  };

  const testCellShouldAlwaysReturnTheSameCell = function (html: string, label: string) {

    const element = Element.fromHtml(html);
    Insert.append(Body.body(), element);

    const cells = SelectorFilter.descendants(Body.body(), 'td');
    if (cells.length === 0) { assert.fail('Could not find any table cell element'); } else {
        Arr.each(cells, function (cell) {
          const result = TableLookup.cell(cell);
          assert.eq(true, result.isSome(), label + ': Expected the result to find something');
          assert.eq(true, Compare.eq(cell, result.getOrDie()), label + ': The result and the expectation should be the same element');
        });

        Remove.remove(element);
    }
  };

  const testRowShouldNotReturn = function (html: string, label: string) {

    const element = Element.fromHtml(html);
    Insert.append(Body.body(), element);

    const rows = SelectorFilter.descendants(Body.body(), 'tr');
    if (rows.length === 0) { assert.fail('Could not find any table row elements'); } else {
      Arr.each(rows, function (row) {
        const result = TableLookup.cell(row);
        assert.eq(false, result.isSome(), label + ': Expected the result to find nothing');
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
  testCellShouldAlwaysReturnTheSameCell(htmlA, 'Testing cells in HTMLA');
  testCellShouldAlwaysReturnTheSameCell(htmlB, 'Testing cells in HTMLB');

  testRowShouldNotReturn(htmlA, 'Testing rows in HTMLA');
  testRowShouldNotReturn(htmlB, 'Testing rows in HTMLB');
});
