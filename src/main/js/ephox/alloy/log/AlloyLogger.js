define(
  'ephox.alloy.log.AlloyLogger',

  [
    'ephox.agar.alien.Truncate'
  ],

  function (Truncate) {
    var element = function (elem) {
      return Truncate.getHtml(elem);
    };

    return {
      element: element
    };
  }
);