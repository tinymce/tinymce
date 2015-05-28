test(
  'RectangularTest',

  [
    'ephox.snooker.selection.Rectangular',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Rectangular, Element, Insert, InsertAll, Remove, SelectorFilter, SelectorFind) {
    var body = SelectorFind.first('body').getOrDie();
    var div = Element.fromTag('div');
    Insert.append(body, div);

     var table = Element.fromHtml(
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

      var table2 = Element.fromHtml('<table id="tableB" border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:none;">'+
       '<tbody><tr>' +
          '<td id="A0" style="min-width: 100px; height: 40px" rowspan="3">A0</td>'+
          '<td id="A1" style="min-width: 100px; height: 40px">A1 </td>'+
          '<td id="A2" style="min-width: 100px; height: 40px">A2 </td>'+
          '<td id="A3" style="min-width: 100px; height: 40px">A3 </td>'+
          '<td id="A4" style="min-width: 100px; height: 40px">A4 </td>'+
          '<td id="A5" style="min-width: 100px; height: 40px">A5 </td> '+
        '</tr>' +
        '<tr>' +
          '<td id="B1" style="min-width: 100px; height: 40px" colspan="2" rowspan=2>B1</td>'+
          '<td id="B2" style="min-width: 100px; height: 40px">B2 </td>'+
          '<td id="B3" style="min-width: 100px; height: 40px">B3 </td>'+
          '<td id="B4" style="min-width: 100px; height: 40px">B4 </td>'+
          '</tr>'+
        '<tr> '+
          '<td id="C1" style="min-width: 100px; height: 40px">C1 </td>'+
          '<td id="C2" style="min-width: 100px; height: 40px" colspan=2 rowspan=2>C2 </td>'+
          // '<td id="C3" style="min-width: 100px; height: 40px">C3 </td>'+
          // '<td id="C4" style="min-width: 100px; height: 40px">C4 </td>'+
          // '<td id="C5" style="min-width: 100px; height: 40px">C5 </td>'+
          '</tr>'+
        '<tr>'+
          '<td id="D1" style="min-width: 100px; height: 40px">D1 </td>'+
          '<td id="D2" style="min-width: 100px; height: 40px">D2 </td>'+
          '<td id="D3" style="min-width: 100px; height: 40px">D3 </td>'+
          '<td id="D4" style="min-width: 100px; height: 40px">D4 </td>'+
          // '<td id="D5" style="min-width: 100px; height: 40px">D5 </td>'+
          // '<td id="D6" style="min-width: 100px; height: 40px">D6 </td>'+
        '</tr> </tbody></table>');

    InsertAll.append(div, [ table, table2 ] );

    var startCellA = SelectorFilter.descendants(table, '#tableA td#B1')[0];
    var endCellA = SelectorFilter.descendants(table, '#tableA td#C3')[0];
    var checkA = Rectangular.isRectangular(table, startCellA, endCellA);
    assert.eq(false, checkA.isRect());


    var startCellB = SelectorFilter.descendants(table, '#tableA td#A1')[0];
    var endCellB = SelectorFilter.descendants(table, '#tableA td#B3')[0];
    var checkB = Rectangular.isRectangular(table, startCellB, endCellB);
    assert.eq(true, checkB.isRect());

    var startCellC = SelectorFilter.descendants(table, '#tableA td#C1')[0];
    var endCellC = SelectorFilter.descendants(table, '#tableA td#B2')[0];
    var checkC = Rectangular.isRectangular(table, startCellC, endCellC);
    assert.eq(true, checkC.isRect());


    var startCellD = SelectorFilter.descendants(table, '#tableA td#D2')[0];
    var endCellD = SelectorFilter.descendants(table, '#tableA td#A4')[0];
    var checkD = Rectangular.isRectangular(table, startCellD, endCellD);
    assert.eq(false, checkD.isRect());


    var startCellE = SelectorFilter.descendants(table, '#tableA td#C1')[0];
    var endCellE = SelectorFilter.descendants(table, '#tableA td#C4')[0];
    var checkE = Rectangular.isRectangular(table, startCellE, endCellE);
    assert.eq(true, checkE.isRect());

    var startCellF = SelectorFilter.descendants(table, '#tableA td#C1')[0];
    var endCellF = SelectorFilter.descendants(table, '#tableA td#D4')[0];
    var checkF = Rectangular.isRectangular(table, startCellF, endCellF);
    assert.eq(true, checkF.isRect());


    var startCellG = SelectorFilter.descendants(table, '#tableA td#C1')[0];
    var endCellG = SelectorFilter.descendants(table, '#tableA td#B4')[0];

    var checkG = Rectangular.isRectangular(table, startCellG, endCellG);
    assert.eq(true, checkG.isRect());

    var startCellH = SelectorFilter.descendants(table, '#tableA td#C1')[0];
    var endCellH = SelectorFilter.descendants(table, '#tableA td#A4')[0];

    var checkH = Rectangular.isRectangular(table, startCellH, endCellH);
    assert.eq(true, checkH.isRect());

    var startCellI = SelectorFilter.descendants(table, '#tableA td#D4')[0];
    var endCellI = SelectorFilter.descendants(table, '#tableA td#A1')[0];
    var checkI = Rectangular.isRectangular(table, startCellI, endCellI);
    assert.eq(true, checkI.isRect());

    var startCellJ = SelectorFilter.descendants(table, '#tableB td#A1')[0];
    var endCellJ = SelectorFilter.descendants(table, '#tableB td#B1')[0];
    var checkJ = Rectangular.isRectangular(table, startCellJ, endCellJ);
    assert.eq(true, checkJ.isRect());



    // Remove.remove(div);
  }
);