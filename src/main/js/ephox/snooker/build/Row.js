define(
  'ephox.snooker.build.Row',

  [
    'ephox.sugar.api.Element'
  ],

  function (Element) {
    return function (columns) {
      var row = Element.fromTag('tr');

      var element = function () {
        return row;
      };

      return {
        element: element
      };
    };
  }
);
