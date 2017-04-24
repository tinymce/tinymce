define(
  'ephox.alloy.behaviour.composing.ComposeApis',

  [

  ],

  function () {
    var getCurrent = function (component, composeConfig, composeState) {
      return composeConfig.find()(component);
    };

    return {
      getCurrent: getCurrent
    };
  }
);