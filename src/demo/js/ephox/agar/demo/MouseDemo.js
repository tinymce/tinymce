define(
  'ephox.agar.demo.MouseDemo',

  [
    'ephox.agar.demo.DemoContainer'
  ],

  function (DemoContainer) {
    return function () {
      DemoContainer.init(
        'Mouse testing',
        function (success, failure) {
          failure('Not implemented.');

          return [ ];
        }
      );
    };
  }
);