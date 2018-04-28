import { TapEvent } from '@ephox/alloy';
import { DomEvent } from '@ephox/sugar';

// TODO: TapEvent needs to be exposed in alloy's API somehow
const monitor = function (editorApi) {
  const tapEvent = TapEvent.monitor({
    triggerEvent (type, evt) {
      editorApi.onTapContent(evt);
    }
  });

  // convenience methods
  const onTouchend = function () {
    return DomEvent.bind(editorApi.body(), 'touchend', function (evt) {
      tapEvent.fireIfReady(evt, 'touchend');
    });
  };

  const onTouchmove = function () {
    return DomEvent.bind(editorApi.body(), 'touchmove', function (evt) {
      tapEvent.fireIfReady(evt, 'touchmove');
    });
  };

  const fireTouchstart = function (evt) {
    tapEvent.fireIfReady(evt, 'touchstart');
  };

  return {
    fireTouchstart,
    onTouchend,
    onTouchmove
  };
};

export default {
  monitor
};