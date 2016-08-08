define(
  'ephox.alloy.demo.Demo',

  [
    'ephox.alloy.api.NoContextApi'
  ],

  function (NoContextApi) {
    return function () {
      console.log('Loading demo');

      var noContext = NoContextApi();
    };
  }
);

