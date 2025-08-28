import { Assert, after, before, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Type } from '@ephox/katamari';
import { Css, Html, Insert, InsertAll, Remove, SugarBody, SugarElement } from '@ephox/sugar';
// import { assert } from 'chai';

import * as Sizes from 'ephox/snooker/api/Sizes';

import { addStyles, readRowHeights, readWidth } from '../module/ephox/snooker/test/SizeUtils';

describe('Table Sizes Test (fusebox)', () => {
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

  const pixelTableTdHeights =
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

  const pixelTableTrHeights =
  '<table border="1" style="border-collapse: collapse; width: 100%;"> ' +
  '<tbody> ' +
  '<tr style="height: 50px;"> <td style="width: 20%;" rowspan="2"></td> ' +
  '<td style="width: 20%;">  </td> ' +
  '<td style="width: 20%;" colspan="2"></td> ' +
  '<td style="width: 20%;" rowspan="2"></td> </tr> ' +
  '<tr style="height: 100px;"> <td style="width: 20%;" rowspan="2"></td> ' +
  '<td style="width: 20%;">  </td> ' +
  '<td style="width: 20%;">  </td> </tr> ' +
  '<tr style="height: 150px;"> <td style="width: 20%;">  </td> ' +
  '<td style="width: 20%;">  </td> ' +
  '<td style="width: 20%;">  </td> ' +
  '<td style="width: 20%;">  </td> </tr> ' +
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

  const generateH = (tdInfo: string[][], trInfo: string[], totalHeight: string) => {
    const table = SugarElement.fromTag('table');
    Css.set(table, 'height', totalHeight);
    const tbody = SugarElement.fromTag('tbody');
    const numRows = tdInfo.length || trInfo.length;
    const trows: SugarElement<HTMLTableRowElement>[] = [];
    Arr.range(numRows, (r) => {
      const tr = SugarElement.fromTag('tr');
      const trHeight = trInfo[r];
      if (Type.isNonNullable(trHeight)) {
        Css.set(tr, 'height', trHeight);
      }
      const numCells = tdInfo[r].length || 1;
      const cells: SugarElement<HTMLTableCellElement>[] = [];
      Arr.range(numCells, (c) => {
        const td = SugarElement.fromTag('td');
        const height = tdInfo[r][c];
        if (Type.isNonNullable(height)) {
          Css.set(td, 'height', height);
        }
        Insert.append(td, SugarElement.fromText(String.fromCharCode('A'.charCodeAt(0) + c) + r));
        cells.push(td);
      });
      InsertAll.append(tr, cells);
      trows.push(tr);
    });
    InsertAll.append(tbody, trows);
    Insert.append(table, tbody);
    return table;
  };

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

  const checkRowHeight = (expectedRowHeights: string[], table: SugarElement<HTMLTableElement>, newTableHeight: string) => {
    Insert.append(SugarBody.body(), table);
    Sizes.redistribute(table, Optional.none(), Optional.some(newTableHeight));
    Assert.eq('check height row', expectedRowHeights, readRowHeights(table));
    Remove.remove(table);
  };

  const checkBasicRowHeightWithTrs = (expectedRowHeights: string[], trHeightsInput: string[], initialTableHeight: string, newTableHeight: string) => {
    const table = generateH([[]], trHeightsInput, initialTableHeight);
    checkRowHeight(expectedRowHeights, table, newTableHeight);
  };

  const checkBasicRowHeightWithTds = (expectedRowHeights: string[], tdHeightsInput: string[][], initialTableHeight: string, newTableHeight: string) => {
    const table = generateH(tdHeightsInput, [], initialTableHeight);
    checkRowHeight(expectedRowHeights, table, newTableHeight);
  };

  let styles: ReturnType<typeof addStyles>;

  before(() => {
    styles = addStyles();
  });

  after(() => {
    styles.remove();
  });

  it('TBA: sanity check table generators', () => {
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
  });

  it('TBA: test basic row height distribution (existing heights on tds)', () => {
    checkBasicRowHeightWithTds([ '50px' ], [[ '10px' ]], '100px', '50px');
    checkBasicRowHeightWithTds([ '99%' ], [[ '10px' ]], '100px', '100%');
    checkBasicRowHeightWithTds([ '48px' ], [[ '10px' ]], '25px', '50px');
    checkBasicRowHeightWithTds([ '96%' ], [[ '10px' ]], '25px', '300%');
  });

  it('TBA: test basic row height distributions (existing heights on trs)', () => {
    checkBasicRowHeightWithTrs([ '5px' ], [ '10px' ], '100px', '50px');
    checkBasicRowHeightWithTrs([ '10%' ], [ '10px' ], '100px', '100%');
    checkBasicRowHeightWithTrs([ '20px' ], [ '10px' ], '25px', '50px');
    checkBasicRowHeightWithTrs([ '40%' ], [ '10px' ], '25px', '300%');

  });

  it('TBA: test basic width distributions', () => {
    checkBasicWidth([[ '2px' ]], [[ '10px' ]], '50px', '10px');
    checkBasicWidth([[ '10px' ]], [[ '10px' ]], '50px', '50px');
    checkBasicWidth([[ '20px' ]], [[ '10px' ]], '50px', '100px');
    checkBasicWidth([[ '20%' ]], [[ '10px' ]], '50px', '200%');
    checkBasicWidth([[ '20%' ]], [[ '10px' ]], '50px', '400%');

    checkBasicWidth([[ '2px' ]], [[ '10px' ]], '50px', '10px');
  });

  it('test more complex height distributions (exising heights on tds)', () => {
    checkRowHeight(
      [ '43px', '103px', '153px' ],
      SugarElement.fromHtml(pixelTableTdHeights),
      '300px'
    );

    checkRowHeight(
      [ '21px', '51px', '78px' ],
      SugarElement.fromHtml(pixelTableTdHeights),
      '150px'
    );

    checkRowHeight(
      [ '14.3%', '34.3%', '51%' ],
      SugarElement.fromHtml(pixelTableTdHeights),
      '100%'
    );

    checkRowHeight(
      [ '14.3%', '34.3%', '51%' ],
      SugarElement.fromHtml(pixelTableTdHeights),
      '150%'
    );
  });

  it('test more complex height distributions (exising heights on trs)', () => {
    checkRowHeight(
      [ '49px', '99px', '151px' ],
      SugarElement.fromHtml(pixelTableTrHeights),
      '300px'
    );

    checkRowHeight(
      [ '24px', '49px', '77px' ],
      SugarElement.fromHtml(pixelTableTrHeights),
      '150px'
    );

    checkRowHeight(
      [ '16.6%', '33.2%', '49.8%' ],
      SugarElement.fromHtml(pixelTableTrHeights),
      '100%'
    );

    checkRowHeight(
      [ '16.6%', '33.2%', '49.8%' ],
      SugarElement.fromHtml(pixelTableTrHeights),
      '150%'
    );
  });

  it('TBA: test more complex width distributions (pixel table)', () => {
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
  });

  it('TBA: test more complex width distributions (percent table)', () => {
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
  });
});
