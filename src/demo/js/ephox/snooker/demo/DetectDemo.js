define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.tbio.Aq',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, CellLookup, Aq, Attr, Css, Element, Insert, SelectorFilter, SelectorFind) {
    return function () {
      var subject = Element.fromHtml(
        '<table style="border-collapse: collapse;"><tbody>' +
          '<tr>' +
            '<td style="width: 110px;">1</td>' +
            '<td colspan="5">.</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 130px;">3</td>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 160px;">6</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=3>.</td>' +
            '<td style="width: 140px;">4</td>' +
            '<td colspan=2>.</td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan=4>.</td>' +
            '<td colspan=2>.</td>' +
          '</tr>' +
          '<tr>' +
            '<td>x</td>' +
            '<td style="width: 120px;">2</td>' +
            '<td colspan=2>.</td>' +
            '<td style="width: 150px;">5</td>' +
            '<td>x</td>' +
          '</tr>' +
        '</tbody></table>'
      );


      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      Insert.append(ephoxUi, subject);


      var rows = SelectorFilter.descendants(subject, 'tr');
      var input = Arr.map(rows, function (row) {
        var cells = SelectorFilter.descendants(row, 'td,th');
        return Arr.map(cells, function (cell) {
          return {
            id: Fun.constant(cell),
            rowspan: Fun.constant(Attr.get(cell, 'rowspan') || 1),
            colspan: Fun.constant(Attr.get(cell, 'colspan') || 1)
          };
        });
      });

      var model = CellLookup.model(input);
      var widths = [];

      // find the width of the 1st column 
      var data = model.data();
      for (var i = 0; i < model.columns(); i++) {
        Arr.find(rows, function (row, r) {
          var key = CellLookup.key(r, i);
          var cell = data[key];
          if (cell && cell.colspan() === 1 && widths[i] === undefined) {
            widths[i] = Css.get(cell.id(), 'width');
          }
        });
      }

      console.log('widths: ', widths);

      var setTheWidths = Aq.aq(input, widths);
      Arr.each(setTheWidths, function (x) {
        console.log('haha', x.width());
        Css.set(x.id(), 'width', x.width());
      });

    };
  }
);
