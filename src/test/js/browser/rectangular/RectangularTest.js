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
              '<td id="B1" style="min-width: 100px; background:#cadbee;">B1 START SELECTION<br /></td>' +
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
              '<td id="C3" style="min-width: 100px; background:#cadbee;">C3 END SELECTION<br /></td>' +
              '<td id="D3" style="min-width: 100px;">D3</td>' +
            '</tr>' +
            '<tr>' +
              '<td id="A4" style="padding-top: 100px;" style="min-width: 100px;">A4</td>' +
              '<td id="B4" style="padding-top: 100px;" style="min-width: 100px;">B4<br /></td>' +
              '<td id="C4" style="padding-top: 100px;" style="min-width: 100px;">C4<br /></td>' +
              '<td id="D4" style="padding-top: 100px;" style="min-width: 100px;">D4</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );
    Insert.append(div, table);
    var startCell = SelectorFilter.descendants(table, 'td#B1')[0];
    var endCell = SelectorFilter.descendants(table, 'td#C3')[0];

    Rectangular.isRectangular(table, startCell, endCell);

    // Remove.remove(div);
  }
);