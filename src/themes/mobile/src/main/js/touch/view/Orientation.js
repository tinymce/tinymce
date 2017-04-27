define(
  'tinymce.themes.mobile.touch.view.Orientation',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'global!clearInterval',
    'global!Math',
    'global!setInterval'
  ],

  function (Fun, Option, DomEvent, Element, clearInterval, Math, setInterval) {

    var INTERVAL = 50;
    var INSURANCE = 1000 / INTERVAL;

    var get = function (outerWindow) {
      // We need to use this because the window shrinks due to an app keyboard,
      // width > height is no longer reliable.
      var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
      return {
        isPortrait: Fun.constant(isPortrait)
      };
    };

    var onChange = function (outerWindow, listeners) {
      var win = Element.fromDom(outerWindow);
      var poller = null;

      var change = function () {
        // If a developer is spamming orientation events in the simulator, clear our last check
        clearInterval(poller);

        var orientation = get();
        listeners.onChange(orientation);

        onAdjustment(function () {
          // We don't care about whether there was a resize or not.
          listeners.onReady(orientation);
        });
      };

      var orientationHandle = DomEvent.bind(win, 'orientationchange', change);

      var onAdjustment = function (f) {
        // If a developer is spamming orientation events in the simulator, clear our last check
        clearInterval(poller);

        var flag = outerWindow.innerHeight;
        var insurance = 0;
        poller = setInterval(function () {
          if (flag !== outerWindow.innerHeight) {
            clearInterval(poller);
            f(Option.some(outerWindow.innerHeight));
          } else if (insurance > INSURANCE) {
            clearInterval(poller);
            f(Option.none());
          }
          insurance++;
        }, INTERVAL);
      };

      var destroy = function () {
        orientationHandle.unbind();
      };

      return {
        onAdjustment: onAdjustment,
        destroy: destroy
      };
    };

    return {
      get: get,
      onChange: onChange
    };
  }
);