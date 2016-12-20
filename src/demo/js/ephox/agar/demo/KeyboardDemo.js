define(
  'ephox.agar.demo.KeyboardDemo',

  [
    'ephox.agar.demo.DemoContainer',
    'ephox.sugar.api.node.Element'
  ],

  function (DemoContainer, Element) {
    return function () {
      DemoContainer.init(
        'Keyboard testing',
        function (success, failure) {

          var container = Element.fromTag('div');


          failure('Not implemented.');

          return [ ];
        }
      );
    };
  }
);