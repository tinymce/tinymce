define(
  'ephox.alloy.menu.logic.HotspotViews',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Focusing, Fun, Option) {
    var onEscape = function (hotspot, sandbox) {
      sandbox.apis().closeSandbox();
      Focusing.focus(hotspot);
      return Option.some(true);
    };

    

    return {
      onEscape: onEscape
    };
  }
);