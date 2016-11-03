define(
  'ephox.alloy.api.ui.InlineApis',

  [

  ],

  function () {
    var setAnchor = function (sandbox, newAnchor) {
      sandbox.apis().setAnchor(newAnchor);
    };

    return {
      setAnchor: setAnchor
    };
  }
);