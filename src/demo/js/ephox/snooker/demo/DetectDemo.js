define(
  'ephox.snooker.demo.DetectDemo',

  [
    'ephox.compass.Arr',
    'ephox.dragster.api.Dragger',
    'ephox.peanut.Fun',
    'ephox.snooker.croc.CellLookup',
    'ephox.snooker.tbio.Aq',
    'ephox.snooker.tbio.query.Lookup',
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

  function (Arr, Dragger, Fun, CellLookup, Aq, Lookup, BoxDragging, TargetMutation, Attr, Class, Compare, Css, DomEvent, Element, Height, Insert, Location, Node, SelectorExists, SelectorFilter, SelectorFind) {
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
          currentWidths[column] = parseInt(currentWidths[column], 10) + delta + 'px';
          console.log('currentWidths: ', currentWidths);

          var setTheWidths2 = Aq.aq(currentInput, currentWidths);
          Arr.each(setTheWidths2, function (x) {
            console.log('setting.width', x.width());
            Css.set(x.id(), 'width', x.width());
          });

          Attr.remove(target, 'data-initial-left');
        });
      });

      DomEvent.bind(ephoxUi, 'mousedown', function (event) {
        if (Class.has(event.target(), 'mogel-mogel')) {
          var body = Element.fromDom(document.body);
          var column = Attr.get(event.target(), 'data-column');
          mutation.assign(event.target());
          Attr.set(event.target(), 'data-initial-left', parseInt(Css.get(event.target(), 'left'), 10));
          resizing.go(body);
        }
      });

      // Find the column lines.
      var position = Location.absolute(subject);
      console.log('position: ', position.left(), position.top());

      var makeResizer = function (x, col) {
        var blocker = Element.fromTag('div');
        Css.setAll(blocker, {
          position: 'absolute',
          left: x - 5,
          top: position.top(),
          height: Height.getOuter(subject),
          width: 10,
          'background-color': 'blue',
          opacity: '0.05',
          cursor: 'w-resize'
        });

        Attr.set(blocker, 'data-column', col);

        Insert.append(ephoxUi, blocker);
        Class.add(blocker, 'mogel-mogel');
        return blocker;
      };

      var current = position.left();
      makeResizer(current, 0);
      for (var i = 0; i < widths.length; i++) {
        current += parseInt(widths[i], 10) + 3;
        console.log('left: ', current);
        makeResizer(current, i);
      }

      DomEvent.bind(ephoxUi, 'mouseover', function (event) {
        if (Node.name(event.target()) === 'table' || SelectorExists.ancestor(event.target(), 'table')) {
          var mogels = SelectorFilter.all('.mogel-mogel');
          Arr.each(mogels, function (mogel) {
            Css.set(mogel, 'display', 'block');
          });
        }
      });

      DomEvent.bind(ephoxUi, 'mouseout', function (event) {
        if (Node.name(event.target()) === 'table') {
          var mogels = SelectorFilter.all('.mogel-mogel');
          Arr.each(mogels, function (mogel) {
            Css.set(mogel, 'display', 'none');
          });
        }
      });

    };
  }
);
