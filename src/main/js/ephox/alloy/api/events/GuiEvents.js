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

      var onClick = DomEvent.bind(container, 'click', function (event) {
        var stopped = settings.triggerEvent('click', event);
        if (stopped) event.kill();
      });

      var onSelectStart = DomEvent.bind(container, 'selectstart', function (event) {
        var stopped = settings.triggerEvent('selectstart', event);
        if (stopped) event.kill();
      });
      
      var onKeydown = DomEvent.bind(container, 'keydown', function (event) {
        // Prevent default of backspace when not in input fields.
        var stopped = settings.triggerEvent('keydown', event);
        if (stopped) event.kill();
        else if (settings.stopBackspace === true && isDangerous(event)) { event.prevent(); }
      });

      var onMousedown = DomEvent.bind(container, 'mousedown', function (event) {
        var stopped = settings.triggerEvent('mousedown', event);
        if (stopped) event.kill();
      });

      var onMouseup = DomEvent.bind(container, 'mouseup', function (event) {
        var stopped = settings.triggerEvent('mouseup', event);
        if (stopped) event.kill();
      });

      var onMouseover = DomEvent.bind(container, 'mouseover', function (event) {
        var stopped = settings.triggerEvent('mouseover', event);
        if (stopped) event.kill();
      });

      var onMousemove = DomEvent.bind(container, 'mousemove', function (event) {
        var stopped = settings.triggerEvent('mousemove', event);
        if (stopped) event.kill();
      });

      var onMouseout = DomEvent.bind(container, 'mouseout', function (event) {
        var stopped = settings.triggerEvent('mouseout', event);
        if (stopped) event.kill();
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

      var onInput = DomEvent.bind(container, 'input', function (event) {
        var stopped = settings.triggerEvent('input', event);
        if (stopped) event.kill();
      });

      var onContextmenu = DomEvent.bind(container, 'contextmenu', function (event) {
        var stopped = settings.triggerEvent('contextmenu', event);
        if (stopped) event.kill();
      });


      var onChange = DomEvent.bind(container, 'change', function (event) {
        var stopped = settings.triggerEvent('change', event);
        if (stopped) event.kill();
      });

      var onTransitionEnd = DomEvent.bind(container, 'transitionend', function (event) {
        var stopped = settings.triggerEvent('transitionend', event);
        if (stopped) event.kill();
      });

      // TODO: Test
      var onDragStart = DomEvent.bind(container, 'dragstart', function (event) {
        var stopped = settings.triggerEvent('dragstart', event);
        if (stopped) event.kill();
      });

      var onDragover = DomEvent.bind(container, 'dragover', function (event) {
        var stopped = settings.triggerEvent('dragover', event);
        if (stopped) event.kill();
      });

      var onDrop = DomEvent.bind(container, 'drop', function (event) {
        var stopped = settings.triggerEvent('drop', event);
        if (stopped) event.kill();
      });

      var defaultView = Traverse.defaultView(container);
      var onWindowScroll = DomEvent.bind(defaultView, 'scroll', function (event) {
        var stopped = settings.broadcastEvent(SystemEvents.windowScroll(), event);
        if (stopped) event.kill();
      });

      var unbind = function () {
        onClick.unbind();
        onSelectStart.unbind();
        onKeydown.unbind();
        onMouseover.unbind();
        onMousedown.unbind();
        onMouseup.unbind();
        onMousemove.unbind();
        onMouseout.unbind();
        onFocusIn.unbind();
        onFocusOut.unbind();
        onInput.unbind();
        onChange.unbind();
        onContextmenu.unbind();
        onTransitionEnd.unbind();
        onDragStart.unbind();
        onDragover.unbind();
        onDrop.unbind();
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