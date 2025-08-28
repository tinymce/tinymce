import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Insert, InsertAll, Remove, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import * as TablePositions from 'ephox/snooker/api/TablePositions';

UnitTest.test('RectangularTest', () => {
  const body = SelectorFind.first('body').getOrDie();
  const div = SugarElement.fromTag('div');
  Insert.append(body, div);

  const table = SugarElement.fromHtml<HTMLTableElement>(
    '<table id="tableA" border=1>' +
       '<tbody>' +
         '<tr>' +
           '<td id="A1" rowspan=3 style="min-width: 100px;">A1</td>' +
           '<td id="B1" style="min-width: 100px; background: #bcabee;">B1 START SELECTION<br /></td>' +
           '<td id="C1" style="min-width: 100px;" colspan=2>C1<br /><br /><br /></td>' +
    // '<td style="min-width: 100px;">D1</td>' +
         '</tr>' +
         '<tr>' +
           // '<td style="min-width: 100px;">A2</td>' +
           '<td id="B2" style="min-width: 100px;">B2<br /><br /></td>' +
           '<td id="C2" style="min-width: 100px;"><p>C2</p><p>More</p></td>' +
           '<td id="D2" style="min-width: 100px;"><br />D2</td>' +
         '</tr>' +
         '<tr>' +
           // '<td style="min-width: 100px;">A3</td>' +
           '<td id="B3" style="min-width: 100px;">B3<br /></td>' +
           '<td id="C3" style="min-width: 100px;">C3 END SELECTION<br /></td>' +
           '<td id="D3" style="min-width: 100px;">D3</td>' +
         '</tr>' +
         '<tr>' +
           '<td id="A4" style="padding-top: 100px; background: #bcabee;" style="min-width: 100px;">A4</td>' +
           '<td id="B4" style="padding-top: 100px;" style="min-width: 100px;">B4<br /></td>' +
           '<td id="C4" style="padding-top: 100px;" style="min-width: 100px;">C4<br /></td>' +
           '<td id="D4" style="padding-top: 100px;" style="min-width: 100px;">D4</td>' +
         '</tr>' +
       '</tbody>' +
     '</table>'
  );

  const table2 = SugarElement.fromHtml<HTMLTableElement>('<table id="tableB" border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:none;">' +
   '<tbody><tr>' +
      '<td id="TBA0" style="min-width: 100px; height: 40px" rowspan="3">A0</td>' +
      '<td id="TBA1" style="min-width: 100px; height: 40px">A1 </td>' +
      '<td id="TBA2" style="min-width: 100px; height: 40px">A2 </td>' +
      '<td id="TBA3" style="min-width: 100px; height: 40px">A3 </td>' +
      '<td id="TBA4" style="min-width: 100px; height: 40px">A4 </td>' +
      '<td id="TBA5" style="min-width: 100px; height: 40px">A5 </td> ' +
    '</tr>' +
    '<tr>' +
      '<td id="TBB1" style="min-width: 100px; height: 40px" colspan="2" rowspan=2>B1</td>' +
      '<td id="TBB2" style="min-width: 100px; height: 40px">B2 </td>' +
      '<td id="TBB3" style="min-width: 100px; height: 40px">B3 </td>' +
      '<td id="TBB4" style="min-width: 100px; height: 40px">B4 </td>' +
      '</tr>' +
    '<tr> ' +
      '<td id="TBC1" style="min-width: 100px; height: 40px">C1 </td>' +
      '<td id="TBC2" style="min-width: 100px; height: 40px" colspan=2 rowspan=2>C2 </td>' +
      // '<td id="TBC3" style="min-width: 100px; height: 40px">C3 </td>'+
      // '<td id="TBC4" style="min-width: 100px; height: 40px">C4 </td>'+
      // '<td id="TBC5" style="min-width: 100px; height: 40px">C5 </td>'+
      '</tr>' +
    '<tr>' +
      '<td id="TBD1" style="min-width: 100px; height: 40px">D1 </td>' +
      '<td id="TBD2" style="min-width: 100px; height: 40px">D2 </td>' +
      '<td id="TBD3" style="min-width: 100px; height: 40px">D3 </td>' +
      '<td id="TBD4" style="min-width: 100px; height: 40px">D4 </td>' +
  // '<td id="TBD5" style="min-width: 100px; height: 40px">D5 </td>'+
  // '<td id="TBD6" style="min-width: 100px; height: 40px">D6 </td>'+
    '</tr> </tbody></table>');

  InsertAll.append(div, [ table, table2 ] );

  const check = (tableTarget: SugarElement<HTMLTableElement>, from: string, to: string, expected: boolean) => {
    Arr.each(tableTarget.dom.querySelectorAll('td'), (td) => {
      td.style.background = '';
    });
    Optional.from(document.querySelector(from) as HTMLTableCellElement).getOrDie('Missing element for "from" selector').style.background = '#cadbee';
    Optional.from(document.querySelector(to) as HTMLTableCellElement).getOrDie('Missing element for "to" selector').style.background = '#5adb33';
    const start = SelectorFilter.descendants<HTMLTableCellElement>(tableTarget, from)[0];
    const finish = SelectorFilter.descendants<HTMLTableCellElement>(tableTarget, to)[0];
    const c = TablePositions.getBox(tableTarget, start, finish);
    Assert.eq('', expected, c.isSome());
  };

  check(table, '#tableA td#B1', '#tableA td#C3', false);

  check(table, '#tableA td#A1', '#tableA td#B3', true);

  check(table, '#tableA td#C1', '#tableA td#B2', true);

  check(table, '#tableA td#D2', '#tableA td#A4', false);

  check(table, '#tableA td#C1', '#tableA td#C4', true);

  check(table, '#tableA td#C1', '#tableA td#D4', true);

  check(table, '#tableA td#C1', '#tableA td#B4', true);

  check(table, '#tableA td#C1', '#tableA td#A4', true);

  check(table, '#tableA td#D4', '#tableA td#A1', true);

  Remove.remove(table);

  check(table2, '#tableB td#TBA1', '#tableB td#TBB1', true);

  check(table2, '#tableB td#TBA0', '#tableB td#TBD1', true);

  check(table2, '#tableB td#TBA1', '#tableB td#TBC2', true);

  check(table2, '#tableB td#TBA4', '#tableB td#TBC2', true);

  check(table2, '#tableB td#TBC2', '#tableB td#TBA4', true);

  check(table2, '#tableB td#TBA5', '#tableB td#TBB1', false);

  check(table2, '#tableB td#TBB4', '#tableB td#TBC1', false);

  Remove.remove(div);
});
