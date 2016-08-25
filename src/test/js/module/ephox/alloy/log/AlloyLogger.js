define(
  'ephox.alloy.log.AlloyLogger',

  [

  ],

  function () {
    // Used for atomic testing where window is not available.
    var element = function (elem) {
      return elem;
    };

    return {
      element: element
    };
  }
);