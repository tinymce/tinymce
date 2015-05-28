define(
  'ephox.darwin.demo.Logbook',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!Date'
  ],

  function (Fun, Css, Element, Insert, Date) {
    // This file was used for a previous demo.
    return function () {
      var logbook = Element.fromTag('div');
      Css.setAll(logbook, {
        width: '800px',
        float: 'right',
        height: '300px',
        overflow: 'scroll',
        border: '1px solid #333'
      });

      var updateLogbook = function (msg) {
        var pre = Element.fromHtml('<p>' + new Date().toString() + ': ' + msg + '</p>');
        Insert.prepend(logbook, pre);
      };

      return {
        element: Fun.constant(logbook)
      };
    };
  }
);