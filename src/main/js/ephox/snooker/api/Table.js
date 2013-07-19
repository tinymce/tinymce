define(
  'ephox.snooker.api.Table',

  [
    'ephox.sugar.api.Element'
  ],

  function (Element) {
    return function (width, height) {
      var table = Element.fromTag('table');

      var element = function () {
        return table;
      };

      return {
        element: element
      };
    };
  }
);
