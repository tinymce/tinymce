define(
  'ephox.snooker.demo.SnookerDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.snooker.activate.Activate',
    'ephox.snooker.build.Table',
    'ephox.snooker.tbio.resize.box.BoxDragging',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Ready'
  ],

  function ($, Activate, Table, BoxDragging, Attr, Css, Element, Insert, Ready) {
    return function () {
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));

      var table = Table(4, 3);

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');

      Css.setAll(table.element(), {
        width: '400px',
        height: '300px'
      });


      var activation = Activate.activate(table.element());
      var dragger = BoxDragging();

      console.log('cell:' , Element.fromHtml('<td>A</td>').dom());

      Insert.append(ephoxUi, editor);
      Insert.append(editor, table.element());

      dragger.events.stop.bind(function () {
        activation.refresh();
      });

      // For firefox.
      Ready.execute(function () {
        document.execCommand("enableInlineTableEditing", null, false);
        document.execCommand("enableObjectResizing", false, "false");
      });

      dragger.connect();

      dragger.open(table.element());
      activation.glossy();
    };
  }
);
