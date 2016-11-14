define(
  'ephox.alloy.api.ui.TabbarApis',

  [

  ],

  function () {
    var selectFirst = function (component) {
      component.apis().selectFirst();
    };

    return {
      selectFirst: selectFirst
    };
  }
);