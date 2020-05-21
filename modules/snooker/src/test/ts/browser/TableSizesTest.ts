import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Option } from '@ephox/katamari';
import { Body, Css, Element, Html, Insert, InsertAll, Remove } from '@ephox/sugar';
import { ResizeDirection } from 'ephox/snooker/api/ResizeDirection';
import * as Sizes from 'ephox/snooker/api/Sizes';
import { TableSize } from 'ephox/snooker/api/TableSize';
import { addStyles, readHeight, readWidth } from '../module/ephox/snooker/test/SizeUtils';

UnitTest.test('Table Sizes Test (fusebox)', function () {
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

  const pixelTableHeight =
  '<table border="1" style="border-collapse: collapse; width: 100%;"> ' +
  '<tbody> ' +
  '<tr> <td style="width: 20%; height: 40px;" rowspan="2"></td> ' +
  '<td style="width: 20%; height: 40px;">  </td> ' +
  '<td style="width: 20%; height: 40px;" colspan="2"></td> ' +
  '<td style="width: 20%; height: 140px;" rowspan="2"></td> </tr> ' +
  '<tr> <td style="width: 20%; height: 250px;" rowspan="2"></td> ' +
  '<td style="width: 20%; height: 100px;">  </td> ' +
  '<td style="width: 20%; height: 100px;">  </td> </tr> ' +
  '<tr> <td style="width: 20%; height: 150px;">  </td> ' +
  '<td style="width: 20%; height: 150px;">  </td> ' +
  '<td style="width: 20%; height: 150px;">  </td> ' +
  '<td style="width: 20%; height: 150px;">  </td> </tr> ' +
  '</tbody> ' +
  '</table';

  const generateW = function (info: string[][], totalWidth: string) {
    const table = Element.fromTag('table');
    Css.set(table, 'width', totalWidth);
    const tbody = Element.fromTag('tbody');
    const trows = Arr.map(info, function (row, r) {
      const tr = Element.fromTag('tr');
      const cells = Arr.map(row, function (width, c) {
        const td = Element.fromTag('td');
        Css.set(td, 'width', width);
        Insert.append(td, Element.fromText(String.fromCharCode('A'.charCodeAt(0) + c) + r));
        return td;
      });
      InsertAll.append(tr, cells);
      return tr;
    });
    InsertAll.append(tbody, trows);
    Insert.append(table, tbody);
    return table;
  };

  const generateH = function (info: string[][], totalHeight: string) {
    const table = Element.fromTag('table');
    Css.set(table, 'height', totalHeight);
    const tbody = Element.fromTag('tbody');
    const trows = Arr.map(info, function (row, r) {
      const tr = Element.fromTag('tr');
      const cells = Arr.map(row, function (height, c) {
        const td = Element.fromTag('td');
        Css.set(td, 'height', height);
        Insert.append(td, Element.fromText(String.fromCharCode('A'.charCodeAt(0) + c) + r));
        return td;
      });
      InsertAll.append(tr, cells);
      return tr;
    });
    InsertAll.append(tbody, trows);
    Insert.append(table, tbody);
    return table;
  };

  assert.eq(
    '<table style="width: 25px;"><tbody>' +
      '<tr><td style="width: 20px;">A0</td><td style="width: 30%;">B0</td></tr>' +
      '<tr><td style="width: 10px;">A1</td><td style="width: 15px;">B1</td></tr>' +
    '</tbody></table>',
    Html.getOuter(generateW([
      [ '20px', '30%' ],
      [ '10px', '15px' ]
    ], '25px'))
  );

  assert.eq([[ '1px', '2px' ], [ '1px', '2px' ]], readWidth(generateW([[ '1px', '2px' ], [ '1px', '2px' ]], '3px')));

  const checkWidth = function (expected: string[][], table: Element, newWidth: string) {
    Insert.append(Body.body(), table);
    Sizes.redistribute(table, Option.some(newWidth), Option.none(), ResizeDirection.ltr, TableSize.getTableSize(table));
    assert.eq(expected, readWidth(table));
    Remove.remove(table);
  };

  const checkBasicWidth = function (expected: string[][], input: string[][], initialWidth: string, newWidth: string) {
    const table = generateW(input, initialWidth);
    checkWidth(expected, table, newWidth);
  };

  const checkHeight = function (expected: string[][], table: Element, newHeight: string) {
    Insert.append(Body.body(), table);
    Sizes.redistribute(table, Option.none(), Option.some(newHeight), ResizeDirection.ltr, TableSize.getTableSize(table));
    assert.eq(expected, readHeight(table));
    Remove.remove(table);
  };

  const checkBasicHeight = function (expected: string[][], input: string[][], initialHeight: string, newHeight: string) {
    const table = generateH(input, initialHeight);
    checkHeight(expected, table, newHeight);
  };

  const styles = addStyles();

  checkBasicHeight([[ '5px' ]], [[ '10px' ]], '100px', '50px');
  checkBasicHeight([[ '10%' ]], [[ '10px' ]], '100px', '100%');
  checkBasicHeight([[ '20px' ]], [[ '10px' ]], '25px', '50px');
  checkBasicHeight([[ '40%' ]], [[ '10px' ]], '25px', '300%');

  checkBasicWidth([[ '2px' ]], [[ '10px' ]], '50px', '10px');
  checkBasicWidth([[ '10px' ]], [[ '10px' ]], '50px', '50px');
  checkBasicWidth([[ '20px' ]], [[ '10px' ]], '50px', '100px');
  checkBasicWidth([[ '20%' ]], [[ '10px' ]], '50px', '200%');
  checkBasicWidth([[ '20%' ]], [[ '10px' ]], '50px', '400%');

  checkBasicWidth([[ '2px' ]], [[ '10px' ]], '50px', '10px');

  checkHeight([
    [ '140px', '40px', '40px', '140px' ],
    [ '250px', '100px', '100px' ],
    [ '150px', '150px', '150px', '150px' ]
  ], Element.fromHtml(pixelTableHeight), '300px');

  checkHeight([
    [ '70px', '20px', '20px', '70px' ],
    [ '125px', '50px', '50px' ],
    [ '75px', '75px', '75px', '75px' ]
  ], Element.fromHtml(pixelTableHeight), '150px');

  checkHeight([
    [ '46.7%', '13.3%', '13.3%', '46.7%' ],
    [ '83.3%', '33.3%', '33.3%' ],
    [ '50%', '50%', '50%', '50%' ]
  ], Element.fromHtml(pixelTableHeight), '100%');

  checkHeight([
    [ '46.7%', '13.3%', '13.3%', '46.7%' ],
    [ '83.3%', '33.3%', '33.3%' ],
    [ '50%', '50%', '50%', '50%' ]
  ], Element.fromHtml(pixelTableHeight), '150%');

  checkWidth([
    [ '10px', '30px', '20px', '25px', '15px' ],
    [ '60px', '25px', '15px' ],
    [ '40px', '60px' ],
    [ '100px' ]
  ], Element.fromHtml(pixelTable), '100px');

  checkWidth([
    [ '100px', '300px', '200px', '250px', '150px' ],
    [ '600px', '250px', '150px' ],
    [ '400px', '600px' ],
    [ '1000px' ]
  ], Element.fromHtml(pixelTable), '1000px');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(pixelTable), '50%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(pixelTable), '100%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(percentTable), '100%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], Element.fromHtml(percentTable), '50%');

  checkWidth([
    [ '10px', '30px', '20px', '25px', '15px' ],
    [ '60px', '25px', '15px' ],
    [ '40px', '60px' ],
    [ '100px' ]
  ], Element.fromHtml(percentTable), '100px');

  checkWidth([
    [ '30px', '90px', '60px', '75px', '45px' ],
    [ '180px', '75px', '45px' ],
    [ '120px', '180px' ],
    [ '300px' ]
  ], Element.fromHtml(percentTable), '300px');

  styles.remove();
});
