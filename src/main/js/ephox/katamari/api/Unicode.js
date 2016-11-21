define(
  'ephox.katamari.api.Unicode',

  [

  ],

  function () {
    var zeroWidth = function () {
      return '\uFEFF';
    };

    return {
      zeroWidth: zeroWidth
    };
  }
);