define(
  'ephox.snooker.demo.SnookerDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.snooker.activate.Activate',
    'ephox.snooker.adjust.Blah',
    'ephox.snooker.adjust.Container',
    'ephox.snooker.build.Table',
    'ephox.snooker.croc.Hippo',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Ready'
  ],

  function ($, Activate, Blah, Container, Table, Hippo, Attr, Css, DomEvent, Element, Insert, InsertAll, Node, Ready) {
    return function () {
      /*
       ANDY's IDEA:

          Transparent divs around the borders of table, use mouse over events to show resize handles like elj does

          Assuming size can be measured correctly

      */

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));

      var table = Table(6, 3);

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');

      Css.setAll(table.element(), {
        width: '400px',
        height: '300px'
      });

      var toggle = Element.fromTag('input');
      Attr.set(toggle, 'type', 'checkbox');
      Attr.set(toggle, 'checked', false);

      var activation = Activate.activate(table.element());

      DomEvent.bind(toggle, 'change', function () {
        var selected = Attr.get(toggle, 'checked');
        if (selected) {
          dragger.open(table.element());
          activation.glossy();
        } else {
          dragger.close();
          activation.plain();
        }
      });

      Insert.append(ephoxUi, toggle);
      Insert.after(toggle, Element.fromText('Manipulate table.'));

      var dragger = Blah();

      console.log('cell:' , Element.fromHtml('<td>A</td>').dom());

      Insert.append(ephoxUi, editor);
      Insert.append(editor, table.element());

      var column = Element.fromTag('input');
      Attr.set(column, 'value', 0);
      var step = Element.fromTag('input');
      Attr.set(step, 'value',0);
      var button = Element.fromTag('button');
      Insert.append(button, Element.fromText('RESIZE'));
      DomEvent.bind(button, 'click', function () {
        activation.resize(parseInt(Attr.get(column, 'value')), parseInt(Attr.get(step, 'value')));
      });
      InsertAll.append(ephoxUi, [ column, step, button ]);

      activation.distribute();

      dragger.events.stop.bind(function () {
        activation.refresh();
      });

      // For firefox.
      Ready.execute(function () {
        document.execCommand("enableInlineTableEditing", null, false);
        document.execCommand("enableObjectResizing", false, "false");
      });

      DomEvent.bind(table.element(), 'mousemove', function (event) {
        if (Node.name(event.target()) === 'td') {
          var hippo = Hippo.index(event.target());
          hippo.each(function (h) {
            console.log('found: ', h.row(), h.column());
          });
        }
      })


      dragger.connect();
    };
  }
);
