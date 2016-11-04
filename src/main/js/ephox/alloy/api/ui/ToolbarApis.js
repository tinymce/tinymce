define(
  'ephox.alloy.api.ui.ToolbarApis',

  [

  ],

  function () {
    var setGroups = function (component, groups) {
      component.apis().setGroups(groups);
    };

    var setGroupSpecs = function (component, specs) {
      component.apis().setGroupSpecs(specs);
    };

    return {
      setGroups: setGroups,
      setGroupSpecs: setGroupSpecs
    };
  }
);