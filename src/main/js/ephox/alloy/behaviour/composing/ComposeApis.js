define(
  'ephox.alloy.behaviour.composing.ComposeApis',

  [

  ],

  function () {
    var getCurrent = function (component, composeInfo) {
      return composeInfo.find()(component);
    };

    return {
      getCurrent: getCurrent
    };
  }
);