define(
  'ephox.sugar.impl.Style',

  [

  ],

  function () {
    // some elements, such as mathml, don't have style attributes
    var isSupported = function (dom) {
      return dom.style !== undefined;
    };

    return {
      isSupported: isSupported
    };
  }
);