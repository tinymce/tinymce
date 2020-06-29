import { Assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLDivElement, HTMLTableElement } from '@ephox/dom-globals';
import { Option, OptionInstances } from '@ephox/katamari';
import { Body, Css, Element, Insert, Remove, Width } from '@ephox/sugar';
import { ResizeDirection } from 'ephox/snooker/api/ResizeDirection';
import * as TableConversions from 'ephox/snooker/api/TableConversions';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { addStyles, assertApproxCellSizes, readWidth } from 'ephox/snooker/test/SizeUtils';

const tOption = OptionInstances.tOption;

const percentTable =
  '<table style="width: 100%;">' +
  '<tbody>' +
  '<tr><td style="width: 10%;">A0</td><td style="width: 30%;">B0</td>' +
  '<td style="width: 20%;">C0</td><td style="width: 25%;">D0</td>' +
  '<td style="width: 15%;">E0</td></tr>' +
  '<tr><td style="width: 60%;" colspan="3">A1</td>' +
  '<td style="width: 25%;">D1</td><td style="width: 15%;">E1</td></tr>' +
  '<tr><td style="width: 40%;" colspan="2">A2</td>' +
  '<td style="width: 60%;" colspan="3">C2</td></tr>' +
  '<tr><td style="width: 100%;" colspan="5">A0</td></tr>' +
  '</tbody>' +
  '</table>';

const pixelTable =
  '<table style="width: 500px;">' +
  '<tbody>' +
  '<tr><td style="width: 50px;">A0</td><td style="width: 150px;">B0</td>' +
  '<td style="width: 100px;">C0</td><td style="width: 125px;">D0</td>' +
  '<td style="width: 75px;">E0</td></tr>' +
  '<tr><td style="width: 300px;" colspan="3">A1</td>' +
  '<td style="width: 125px;">D1</td><td style="width: 75px;">E1</td></tr>' +
  '<tr><td style="width: 200px;" colspan="2">A2</td>' +
  '<td style="width: 300px;" colspan="3">C2</td></tr>' +
  '<tr><td style="width: 500px;" colspan="5">A0</td></tr>' +
  '</tbody>' +
  '</table>';

const noneTable =
  '<table>' +
  '<tbody>' +
  '<tr><td>A0</td><td>B0</td><td>C0</td><td>D0</td><td>E0</td></tr>' +
  '<tr><td colspan="3">A1</td><td>D1</td><td>E1</td></tr>' +
  '<tr><td colspan="2">A2</td><td colspan="3">C2</td></tr>' +
  '<tr><td colspan="5">A0</td></tr>' +
  '</tbody>' +
  '</table>';


UnitTest.test('TableConversions.convertToPixelSize', () => {
  const container = Element.fromHtml<HTMLDivElement>('<div style="width: 500px; position: relative;"></div>');
  Insert.append(Body.body(), container);

  const check = (expectedTableWidth: string, expected: string[][], table: Element<HTMLTableElement>, approx: boolean) => {
    Insert.append(container, table);
    TableConversions.convertToPixelSize(table, ResizeDirection.ltr, TableSize.getTableSize(table));
    if (approx) {
      Assert.eq('Assert table width', true, Math.abs(parseFloat(expectedTableWidth) - Width.get(table)) <= 2);
      assertApproxCellSizes(expected, readWidth(table), 2);
    } else {
      Assert.eq('Assert table width', expectedTableWidth, Width.get(table) + 'px');
      Assert.eq('Assert cell widths', expected, readWidth(table));
    }
    Remove.remove(table);
  };

  const styles = addStyles();

  check('500px', [
    [ '50px', '150px', '100px', '125px', '75px' ],
    [ '300px', '125px', '75px' ],
    [ '200px', '300px' ],
    [ '500px' ]
  ], Element.fromHtml(pixelTable), false);

  check('500px', [
    [ '50px', '150px', '100px', '125px', '75px' ],
    [ '300px', '125px', '75px' ],
    [ '200px', '300px' ],
    [ '500px' ]
  ], Element.fromHtml(percentTable), false);

  check('141px', [
    [ '25px', '25px', '25px', '25px', '25px' ],
    [ '75px', '25px', '25px' ],
    [ '50px', '75px' ],
    [ '125px' ]
  ], Element.fromHtml(noneTable), true);

  styles.remove();
  Remove.remove(container);
});

UnitTest.test('TableConversions.convertToPercentSize', () => {
  const container = Element.fromHtml<HTMLDivElement>('<div style="width: 500px; position: relative;"></div>');
  Insert.append(Body.body(), container);

  const check = (expectedTableWidth: string, expected: string[][], table: Element<HTMLTableElement>, approx: boolean) => {
    Insert.append(container, table);
    TableConversions.convertToPercentSize(table, ResizeDirection.ltr, TableSize.getTableSize(table));
    if (approx) {
      const delta = parseFloat(expectedTableWidth) - parseFloat(Css.getRaw(table, 'width').getOrDie());
      Assert.eq('Assert table width', true, Math.abs(delta) <= 2);
      assertApproxCellSizes(expected, readWidth(table), 2);
    } else {
      Assert.eq('Assert table width', Option.some(expectedTableWidth), Css.getRaw(table, 'width'), tOption());
      Assert.eq('Assert cell widths', expected, readWidth(table));
    }
    Remove.remove(table);
  };

  const styles = addStyles();

  check('100%', [
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(percentTable), false);

  check('100%', [
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(pixelTable), false);

  check('28%', [
    [ '18%', '18%', '18%', '18%', '18%' ],
    [ '54%', '18%', '18%' ],
    [ '36%', '54%' ],
    [ '90%' ]
  ], Element.fromHtml(noneTable), true);

  styles.remove();
  Remove.remove(container);
});

UnitTest.test('TableConversions.convertToNoneSize', () => {
  const container = Element.fromHtml<HTMLDivElement>('<div style="width: 500px; position: relative;"></div>');
  Insert.append(Body.body(), container);

  const check = (expected: (string | null)[][], table: Element<HTMLTableElement>) => {
    Insert.append(container, table);
    TableConversions.convertToNoneSize(table);
    Assert.eq('Assert no table width', Option.none<string>(), Css.getRaw(table, 'width'), tOption());
    Assert.eq('Assert no cell widths', expected, readWidth(table));
    Remove.remove(table);
  };

  const styles = addStyles();

  check([
    [ null, null, null, null, null ],
    [ null, null, null ],
    [ null, null ],
    [ null ]
  ], Element.fromHtml(noneTable));

  check([
    [ null, null, null, null, null ],
    [ null, null, null ],
    [ null, null ],
    [ null ]
  ], Element.fromHtml(percentTable));

  check([
    [ null, null, null, null, null ],
    [ null, null, null ],
    [ null, null ],
    [ null ]
  ], Element.fromHtml(pixelTable));

  styles.remove();
  Remove.remove(container);
});
