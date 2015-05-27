test(
  'RectangularTest',

  [
    'ephox.snooker.selection.Rectangular',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Rectangular, Element, Insert, Remove, SelectorFilter, SelectorFind) {
    var body = SelectorFind.first('body').getOrDie();
    var div = Element.fromTag('div');
    Insert.append(body, div);

     var table = Element.fromHtml(
        '<table border=1>' +
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
    Insert.append(div, table);
    // var startCellA = SelectorFilter.descendants(table, 'td#B1')[0];
    // var endCellA = SelectorFilter.descendants(table, 'td#C3')[0];

    // var checkA = Rectangular.isRectangular(table, startCellA, endCellA);
    // assert.eq(false, checkA.isRect());


    // var startCellB = SelectorFilter.descendants(table, 'td#A1')[0];
    // var endCellB = SelectorFilter.descendants(table, 'td#B3')[0];

    // var checkB = Rectangular.isRectangular(table, startCellB, endCellB);
    // assert.eq(true, checkB.isRect());

    // var startCellC = SelectorFilter.descendants(table, 'td#C1')[0];
    // var endCellC = SelectorFilter.descendants(table, 'td#B2')[0];

    // var checkC = Rectangular.isRectangular(table, startCellC, endCellC);
    // assert.eq(false, checkC.isRect());


    // var startCellD = SelectorFilter.descendants(table, 'td#D2')[0];
    // var endCellD = SelectorFilter.descendants(table, 'td#A4')[0];

    // var checkD = Rectangular.isRectangular(table, startCellD, endCellD);
    // assert.eq(false, checkD.isRect());


    var startCellE = SelectorFilter.descendants(table, 'td#C1')[0];
    var endCellE = SelectorFilter.descendants(table, 'td#C4')[0];

    var checkE = Rectangular.isRectangular(table, startCellE, endCellE);
    assert.eq(false, checkE.isRect());

    var startCellF = SelectorFilter.descendants(table, 'td#C1')[0];
    var endCellF = SelectorFilter.descendants(table, 'td#D4')[0];

    var checkF = Rectangular.isRectangular(table, startCellF, endCellF);
    assert.eq(true, checkF.isRect());


    var startCellG = SelectorFilter.descendants(table, 'td#C1')[0];
    var endCellG = SelectorFilter.descendants(table, 'td#B4')[0];

    var checkG = Rectangular.isRectangular(table, startCellG, endCellG);
    assert.eq(false, checkG.isRect());

    var startCellH = SelectorFilter.descendants(table, 'td#C1')[0];
    var endCellH = SelectorFilter.descendants(table, 'td#A4')[0];

    var checkH = Rectangular.isRectangular(table, startCellH, endCellH);
    assert.eq(false, checkH.isRect());


    // Remove.remove(div);
  }
);