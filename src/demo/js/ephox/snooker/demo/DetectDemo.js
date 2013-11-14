define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.snooker.tbio.resize.box.BoxDragging',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Fun, CellLookup, Aq, Lookup, BoxDragging, Attr, Compare, Css, DomEvent, Element, Insert, Node, SelectorFilter, SelectorFind) {
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
      var input = Lookup.information(subject);

      var model = CellLookup.model(input);
      var widths = Lookup.widths(input);

      console.log('widths: ', widths);

      var setTheWidths = Aq.aq(input, widths);
      Arr.each(setTheWidths, function (x) {
        console.log('haha', x.width());
        Css.set(x.id(), 'width', x.width());
      });

      DomEvent.bind(subject, 'mousemove', function (event) {
        if (Node.name(event.target()) === 'td') return;
        console.log(event.target().dom());
      });


      var dragger = BoxDragging();
      dragger.connect();
      dragger.assign(subject);

    };
  }
);
