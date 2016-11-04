define(
  'ephox.alloy.api.ui.SplitToolbarApis',

  [

  ],

  function () {
    var refresh = function (toolstrip) {
      toolstrip.apis().refresh();
    };

    var setGroups = function (toolstrip, groups) {
      toolstrip.apis().setGroups(groups);
    };

    return {
      refresh: refresh,
      setGroups: setGroups
    };
  }
);