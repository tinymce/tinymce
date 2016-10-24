define(
  'ephox.alloy.menu.logic.HotspotViews',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var onEscape = function (hotspot, sandbox) {
      sandbox.apis().closeSandbox();
      hotspot.apis().focus();
      return Option.some(true);
    };

    return {
      onEscape: onEscape
    };
  }
);