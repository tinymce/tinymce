import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Css, Html, Insert, InsertAll, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as Sizes from 'ephox/snooker/api/Sizes';

import { addStyles, readHeight, readWidth } from '../module/ephox/snooker/test/SizeUtils';

UnitTest.test('Table Sizes Test (fusebox)', () => {
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

  const generateW = (info: string[][], totalWidth: string) => {
    const table = SugarElement.fromTag('table');
    Css.set(table, 'width', totalWidth);
    const tbody = SugarElement.fromTag('tbody');
    const trows = Arr.map(info, (row, r) => {
      const tr = SugarElement.fromTag('tr');
      const cells = Arr.map(row, (width, c) => {
        const td = SugarElement.fromTag('td');
        Css.set(td, 'width', width);
        Insert.append(td, SugarElement.fromText(String.fromCharCode('A'.charCodeAt(0) + c) + r));
        return td;
      });
      InsertAll.append(tr, cells);
      return tr;
    });
    InsertAll.append(tbody, trows);
    Insert.append(table, tbody);
    return table;
  };

  const generateH = (info: string[][], totalHeight: string) => {
    const table = SugarElement.fromTag('table');
    Css.set(table, 'height', totalHeight);
    const tbody = SugarElement.fromTag('tbody');
    const trows = Arr.map(info, (row, r) => {
      const tr = SugarElement.fromTag('tr');
      const cells = Arr.map(row, (height, c) => {
        const td = SugarElement.fromTag('td');
        Css.set(td, 'height', height);
        Insert.append(td, SugarElement.fromText(String.fromCharCode('A'.charCodeAt(0) + c) + r));
        return td;
      });
      InsertAll.append(tr, cells);
      return tr;
    });
    InsertAll.append(tbody, trows);
    Insert.append(table, tbody);
    return table;
  };

  Assert.eq('',
    '<table style="width: 25px;"><tbody>' +
      '<tr><td style="width: 20px;">A0</td><td style="width: 30%;">B0</td></tr>' +
      '<tr><td style="width: 10px;">A1</td><td style="width: 15px;">B1</td></tr>' +
    '</tbody></table>',
    Html.getOuter(generateW([
      [ '20px', '30%' ],
      [ '10px', '15px' ]
    ], '25px'))
  );

  Assert.eq('', [[ '1px', '2px' ], [ '1px', '2px' ]], readWidth(generateW([[ '1px', '2px' ], [ '1px', '2px' ]], '3px')));

  const checkWidth = (expected: string[][], table: SugarElement<HTMLTableElement>, newWidth: string) => {
    Insert.append(SugarBody.body(), table);
    Sizes.redistribute(table, Optional.some(newWidth), Optional.none());
    Assert.eq('', expected, readWidth(table));
    Remove.remove(table);
  };

  const checkBasicWidth = (expected: string[][], input: string[][], initialWidth: string, newWidth: string) => {
    const table = generateW(input, initialWidth);
    checkWidth(expected, table, newWidth);
  };

  const checkHeight = (expected: string[][], table: SugarElement<HTMLTableElement>, newHeight: string) => {
    Insert.append(SugarBody.body(), table);
    Sizes.redistribute(table, Optional.none(), Optional.some(newHeight));
    Assert.eq('', expected, readHeight(table));
    Remove.remove(table);
  };

  const checkBasicHeight = (expected: string[][], input: string[][], initialHeight: string, newHeight: string) => {
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
  ], SugarElement.fromHtml(pixelTableHeight), '300px');

  checkHeight([
    [ '70px', '20px', '20px', '70px' ],
    [ '125px', '50px', '50px' ],
    [ '75px', '75px', '75px', '75px' ]
  ], SugarElement.fromHtml(pixelTableHeight), '150px');

  checkHeight([
    [ '46.7%', '13.3%', '13.3%', '46.7%' ],
    [ '83.3%', '33.3%', '33.3%' ],
    [ '50%', '50%', '50%', '50%' ]
  ], SugarElement.fromHtml(pixelTableHeight), '100%');

  checkHeight([
    [ '46.7%', '13.3%', '13.3%', '46.7%' ],
    [ '83.3%', '33.3%', '33.3%' ],
    [ '50%', '50%', '50%', '50%' ]
  ], SugarElement.fromHtml(pixelTableHeight), '150%');

  checkWidth([
    [ '10px', '30px', '20px', '25px', '15px' ],
    [ '60px', '25px', '15px' ],
    [ '40px', '60px' ],
    [ '100px' ]
  ], SugarElement.fromHtml(pixelTable), '100px');

  checkWidth([
    [ '100px', '300px', '200px', '250px', '150px' ],
    [ '600px', '250px', '150px' ],
    [ '400px', '600px' ],
    [ '1000px' ]
  ], SugarElement.fromHtml(pixelTable), '1000px');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], SugarElement.fromHtml(pixelTable), '50%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], SugarElement.fromHtml(pixelTable), '100%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], SugarElement.fromHtml(percentTable), '100%');

  checkWidth([
    [ '10%', '30%', '20%', '25%', '15%' ],
    [ '60%', '25%', '15%' ],
    [ '40%', '60%' ],
    [ '100%' ]
  ], SugarElement.fromHtml(percentTable), '50%');

  checkWidth([
    [ '10px', '30px', '20px', '25px', '15px' ],
    [ '60px', '25px', '15px' ],
    [ '40px', '60px' ],
    [ '100px' ]
  ], SugarElement.fromHtml(percentTable), '100px');

  checkWidth([
    [ '30px', '90px', '60px', '75px', '45px' ],
    [ '180px', '75px', '45px' ],
    [ '120px', '180px' ],
    [ '300px' ]
  ], SugarElement.fromHtml(percentTable), '300px');

  styles.remove();
});
