define(
  'ephox.alloy.api.GuiEvents',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.classify.Type',
    'ephox.compass.Arr',
    'ephox.fred.PlatformDetection',
    'ephox.perhaps.Result',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Node',
    'global!setTimeout'
  ],

  function (Keys, SystemEvents, FieldPresence, FieldSchema, ValueSchema, Type, Arr, PlatformDetection, Result, DomEvent, Node, setTimeout) {
    var isFunction = function (v) {
      return Type.isFunction(v) ? Result.value(v) : Result.error('Not a function');
    };

    var isDangerous = function (event) {
      // Will trigger the Back button in the browser
      return event.raw().which === Keys.BACKSPACE()[0] && !Arr.contains([ 'input', 'textarea' ], Node.name(event.target()));
    };

    var isFirefox = PlatformDetection.detect().browser.isFirefox();

    var settingsSchema = ValueSchema.objOf([
      // triggerEvent(eventName, event)
      FieldSchema.field('triggerEvent', 'triggerEvent', FieldPresence.strict(), ValueSchema.valueOf(isFunction)),
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

      var onMouseover = DomEvent.bind(container, 'mouseover', function (event) {
        var stopped = settings.triggerEvent('mouseover', event);
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

      var onChange = DomEvent.bind(container, 'change', function (event) {
        var stopped = settings.triggerEvent('change', event);
        if (stopped) event.kill();
      });

      var onTransitionEnd = DomEvent.bind(container, 'transitionend', function (event) {
        var stopped = settings.triggerEvent('transitionend', event);
        if (stopped) event.kill();
      });

      var unbind = function () {
        onClick.unbind();
        onSelectStart.unbind();
        onKeydown.unbind();
        onMouseover.unbind();
        onFocusIn.unbind();
        onFocusOut.unbind();
        onInput.unbind();
        onChange.unbind();
        onTransitionEnd.unbind();
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