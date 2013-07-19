define(
  'ephox.snooker.demo.SnookerDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.snooker.adjust.Container',
    'ephox.snooker.build.Table',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function ($, Container, Table, Css, Element, Insert) {
    return function () {
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var table = Table(2, 2);

      Css.setAll(table.element(), {
        width: '400px',
        height: '300px'
      });

      var adjuster = Container();


      Insert.append(ephoxUi, table.element());
      adjuster.show(table.element());
    };
  }
);
