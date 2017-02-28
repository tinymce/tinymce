define(
  'ephox.alloy.api.events.GuiEvents',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.Traverse',
    'global!setTimeout'
  ],

  function (Keys, SystemEvents, FieldSchema, ValueSchema, Arr, PlatformDetection, DomEvent, Node, Traverse, setTimeout) {
    var isDangerous = function (event) {
      // Will trigger the Back button in the browser
      return event.raw().which === Keys.BACKSPACE()[0] && !Arr.contains([ 'input', 'textarea' ], Node.name(event.target()));
    };

    var isFirefox = PlatformDetection.detect().browser.isFirefox();

    var settingsSchema = ValueSchema.objOf([
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

      // These events are just passed through ... not additional processing
      var simpleEvents = Arr.map([
        'click',
        'selectstart',
        'mousedown',
        'mouseup',
        'mouseover',
        'mousemove',
        'mouseout',
        'focusin',
        'input',
        'contextmenu',
        'change',
        'transitionend',
        // Test
        'dragstart',
        'dragover',
        'drop',

        'touchstart',
        'touchend',
        'touchmove',
        'gesturestart'
      ], function (type) {
        return DomEvent.bind(container, type, function (event) {
          var stopped = settings.triggerEvent(type, event);
          if (stopped) event.kill();
        });
      });

      var onKeydown = DomEvent.bind(container, 'keydown', function (event) {
        // Prevent default of backspace when not in input fields.
        var stopped = settings.triggerEvent('keydown', event);
        if (stopped) event.kill();
        else if (settings.stopBackspace === true && isDangerous(event)) { event.prevent(); }
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
        onFocusOut.unbind();
        onWindowScroll.unbind();
      };

      return {
        unbind: unbind
      };
    };

    return {
      setup: setup
    };
  }
);