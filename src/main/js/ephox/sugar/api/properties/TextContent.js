define(
  'ephox.sugar.api.properties.TextContent',

  [
    
  ],

  function () {
    // REQUIRES IE9
    var get = function (element) {
      return element.dom().textContent;
    };

    var set = function (element, value) {
      element.dom().textContent = value;
    };

    return {
      get: get,
      set: set
    };
  }
);
