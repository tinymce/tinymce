define(
  'tinymce.themes.mobile.util.TappingEvent',

  [
    'ephox.alloy.events.TapEvent',
    'ephox.sugar.api.events.DomEvent'
  ],

  function (TapEvent, DomEvent) {
    // TODO: TapEvent needs to be exposed in alloy's API somehow
    var monitor = function (editorApi) {
      var tapEvent = TapEvent.monitor({
        triggerEvent: function (type, evt) {
          editorApi.onTapContent(evt);
        }
      });

      // convenience methods
      var onTouchend = function () {
        return DomEvent.bind(editorApi.body(), 'touchend', function (evt) {
          tapEvent.fireIfReady(evt, 'touchend');
        });
      };
      
      var onTouchmove = function () {
        return DomEvent.bind(editorApi.body(), 'touchmove', function (evt) {
          tapEvent.fireIfReady(evt, 'touchmove');
        });
      };

      var fireTouchstart = function (evt) {
        tapEvent.fireIfReady(evt, 'touchstart');
      };

      return {
        fireTouchstart: fireTouchstart,
        onTouchend: onTouchend,
        onTouchmove: onTouchmove
      };
    };

    return {
      monitor: monitor
    };
  }
);
