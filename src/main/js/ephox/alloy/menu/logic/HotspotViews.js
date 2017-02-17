define(
  'ephox.alloy.menu.logic.HotspotViews',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Focusing, Sandboxing, Fun, Option) {
    var onEscape = function (anchor, sandbox) {

      Sandboxing.closeSandbox(sandbox);
      // TODO: Move.
      if (anchor.anchor === 'hotspot') Focusing.focus(anchor.hotspot);
      else if (anchor.anchor === 'makeshift') {
        anchor.onEscape(sandbox);
      }
      return Option.some(true);
    };

    

    return {
      onEscape: onEscape
    };
  }
);