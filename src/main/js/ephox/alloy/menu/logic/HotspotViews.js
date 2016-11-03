define(
  'ephox.alloy.menu.logic.HotspotViews',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Focusing, Sandboxing, Fun, Option) {
    var onEscape = function (hotspot, sandbox) {
      Sandboxing.closeSandbox(sandbox);
      Focusing.focus(hotspot);
      return Option.some(true);
    };

    

    return {
      onEscape: onEscape
    };
  }
);