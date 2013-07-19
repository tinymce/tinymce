define(
  'ephox.snooker.demo.SnookerDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.snooker.activate.Activate',
    'ephox.snooker.adjust.Blah',
    'ephox.snooker.adjust.Container',
    'ephox.snooker.build.Table',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function ($, Activate, Blah, Container, Table, Attr, Css, Element, Insert) {
    return function () {
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var table = Table(6, 3);

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');

      Css.setAll(table.element(), {
        width: '400px',
        height: '300px'
      });

      var dragger = Blah();

      console.log('cell:' , Element.fromHtml('<td>A</td>').dom());

      Insert.append(ephoxUi, editor);
      Insert.append(editor, table.element());

      dragger.connect();
      dragger.open(table.element());

      Activate.glossy(table.element());
    };
  }
);
