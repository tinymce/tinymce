define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.peanut.Fun',
    'ephox.snooker.activate.Water',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.query.Lookup',
    'ephox.snooker.tbio.resize.bar.Bars',
    'ephox.snooker.tbio.resize.box.BoxDragging',
    'ephox.snooker.tbio.resize.common.TargetMutation',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorExists',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Arr, Dragger, Fun, Water, CellLookup, Aq, Lookup, Bars, BoxDragging, TargetMutation, Attr, Class, Compare, Css, DomEvent, Element, Height, Insert, Location, Node, SelectorExists, SelectorFilter, SelectorFind) {
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

      var mutation = TargetMutation();
      var resizing = Dragger.transform(mutation, {});
      resizing.on();

      mutation.events.drag.bind(function (event) {
        var column = Attr.get(event.target(), 'data-column');
        var current = parseInt(Css.get(event.target(), 'left'), 10);
        Css.set(event.target(), 'left', current + event.xDelta() + 'px');

        // resize(column, event.xDelta());
        // Dimensions.adjust(event.target(), event.xDelta(), 0);
      });

      resizing.events.stop.bind(function (event) {
        mutation.get().each(function (target) {
          var current = parseInt(Css.get(target, 'left'), 10);
          var old = Attr.get(target, 'data-initial-left');
          var delta = current - old;
          console.log('delta: ', delta);

          var currentInput = Lookup.information(subject);
          var currentWidths = Lookup.widths(currentInput);

          var column = Attr.get(target, 'data-column');
          var ice = Arr.map(currentWidths, function (w) {
            return parseInt(w, 10);
          });
          console.log('ice: ', ice, column, delta);

          var adjustments = Water.water(ice, parseInt(column, 10), delta, 10);
          console.log('adjustment: ', adjustments);

          var setTheWidths2 = Aq.aq(currentInput, Arr.map(adjustments, function (adjust, i) {
            return adjust + ice[i];
          }));
          Arr.each(setTheWidths2, function (x, i) {
            console.log('setting.width', x.width(), x.id().dom());
            Css.set(x.id(), 'width', x.width() + 'px');
          });

          Attr.remove(target, 'data-initial-left');
          Bars.refresh(ephoxUi, subject);
        });
      });

      DomEvent.bind(ephoxUi, 'mousedown', function (event) {
        if (Bars.isVBar(event.target())) {
          var body = Element.fromDom(document.body);
          var column = Attr.get(event.target(), 'data-column');
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-left', parseInt(Css.get(event.target(), 'left'), 10));
          resizing.go(body);
        }
      });

      DomEvent.bind(ephoxUi, 'mouseover', function (event) {
        if (Node.name(event.target()) === 'table' || SelectorExists.ancestor(event.target(), 'table')) {
          Bars.show(ephoxUi);
        }
      });

      DomEvent.bind(ephoxUi, 'mouseout', function (event) {
        if (Node.name(event.target()) === 'table') {
          Bars.hide(ephoxUi);
        }
      });

      Bars.refresh(ephoxUi, subject);

    };
  }
);
