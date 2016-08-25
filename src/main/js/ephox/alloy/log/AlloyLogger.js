define(
  'ephox.alloy.log.AlloyLogger',

  [
    'ephox.alloy.alien.Truncate'
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