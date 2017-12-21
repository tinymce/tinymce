import Keys from '../alien/Keys';
import SystemEvents from '../api/events/SystemEvents';
import TapEvent from './TapEvent';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var isDangerous = function (event) {
  // Will trigger the Back button in the browser
  return event.raw().which === Keys.BACKSPACE()[0] && !Arr.contains([ 'input', 'textarea' ], Node.name(event.target()));
};

var isFirefox = PlatformDetection.detect().browser.isFirefox();

var settingsSchema = ValueSchema.objOfOnly([
  // triggerEvent(eventName, event)
  FieldSchema.strictFunction('triggerEvent'),
  FieldSchema.strictFunction('broadcastEvent'),
  FieldSchema.defaulted('stopBackspace', true)
]);

var bindFocus = function (container, handler) {
  if (isFirefox) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    return DomEvent.capture(container, 'focus', handler);
  } else {
    return DomEvent.bind(container, 'focusin', handler);
  }
};

var bindBlur = function (container, handler) {
  if (isFirefox) {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=687787
    return DomEvent.capture(container, 'blur', handler);
  } else {
    return DomEvent.bind(container, 'focusout', handler);
  }
};

var setup = function (container, rawSettings) {
  var settings = ValueSchema.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);

  var pointerEvents = PlatformDetection.detect().deviceType.isTouch() ? [
    'touchstart',
    'touchmove',
    'touchend',
    'gesturestart'
  ] : [
    'mousedown',
    'mouseup',
    'mouseover',
    'mousemove',
    'mouseout',
    'click'
  ];

  var tapEvent = TapEvent.monitor(settings);

  // These events are just passed through ... no additional processing
  var simpleEvents = Arr.map(
    pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      // Test the drag events
      'dragstart',
      'dragover',
      'drop'
    ]),
    function (type) {
      return DomEvent.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped) event.kill();
        });

        var stopped = settings.triggerEvent(type, event);
        if (stopped) event.kill();
      });
    }
  );

  var onKeydown = DomEvent.bind(container, 'keydown', function (event) {
    // Prevent default of backspace when not in input fields.
    var stopped = settings.triggerEvent('keydown', event);
    if (stopped) event.kill();
    else if (settings.stopBackspace === true && isDangerous(event)) { event.prevent(); }
  });

  var onFocusIn = bindFocus(container, function (event) {
    var stopped = settings.triggerEvent('focusin', event);
    if (stopped) event.kill();
  });

  var onFocusOut = bindBlur(container, function (event) {
    var stopped = settings.triggerEvent('focusout', event);
    if (stopped) event.kill();

    // INVESTIGATE: Come up with a better way of doing this. Related target can be used, but not on FF.
    // It allows the active element to change before firing the blur that we will listen to
    // for things like closing popups
    setTimeout(function () {
      settings.triggerEvent(SystemEvents.postBlur(), event);
    }, 0);
  });

  var defaultView = Traverse.defaultView(container);
  var onWindowScroll = DomEvent.bind(defaultView, 'scroll', function (event) {
    var stopped = settings.broadcastEvent(SystemEvents.windowScroll(), event);
    if (stopped) event.kill();
  });

  var unbind = function () {
    Arr.each(simpleEvents, function (e) {
      e.unbind();
    });
    onKeydown.unbind();
    onFocusIn.unbind();
    onFocusOut.unbind();
    onWindowScroll.unbind();
  };

  return {
    unbind: unbind
  };
};

export default <any> {
  setup: setup
};