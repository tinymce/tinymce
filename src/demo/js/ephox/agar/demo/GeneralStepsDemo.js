define(
  'ephox.agar.demo.GeneralStepsDemo',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.demo.DemoContainer',
    'ephox.sugar.api.node.Element'
  ],

  function (Pipeline, Step, DemoContainer, Element) {
    return function () {
      DemoContainer.init(
        'General Steps Demo',
        function (success, failure) {
          var outcome = Element.fromTag('div');
        
          Pipeline.async({}, [
            Step.wait(1000),
            Step.fail('I am an error')
          ], success, failure);

          return [ outcome ];
        }
      );      
    };
  }
);