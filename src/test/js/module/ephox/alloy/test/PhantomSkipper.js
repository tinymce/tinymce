define(
  'ephox.alloy.test.PhantomSkipper',

  [

  ],

  function () {
    var skip = function () {
      return navigator.userAgent.indexOf('PhantomJS') > -1;
    };

    return {
      skip: skip
    };
  }
);
