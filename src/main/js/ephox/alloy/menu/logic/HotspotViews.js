define(
  'ephox.alloy.menu.logic.HotspotViews',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fun, Option) {
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