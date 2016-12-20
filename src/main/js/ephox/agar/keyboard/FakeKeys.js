define(
  'ephox.agar.keyboard.FakeKeys',

  [
    'ephox.sand.api.PlatformDetection',
    'global!Object'
  ],

  function (PlatformDetection, Object) {
    // Take from Orwellophile's answer on
    // http://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key
    var keyevent = function (type, doc, value, modifiers, focus) {
      var oEvent = doc.dom().createEvent('KeyboardEvent');
      var getter = function () {
        return value;
      };
      var defineGetter = function (obj, key, propGetter) {
        Object.defineProperty(obj, key, { get: propGetter, enumerable: true });
      };
      var dispatcher = focus !== undefined ? focus : doc;

      var platform = PlatformDetection.detect();
      if (platform.browser.isSafari() || platform.browser.isIE()) {
        safari(type, doc, value, modifiers, dispatcher);
      } else {

        if (platform.browser.isChrome() || platform.browser.isEdge()) {
          defineGetter(oEvent, 'keyCode', getter);
          defineGetter(oEvent, 'which', getter);
          defineGetter(oEvent, 'shiftKey', function () { return modifiers.shift === true; });
          defineGetter(oEvent, 'metaKey', function () { return modifiers.meta === true; });
          defineGetter(oEvent, 'ctrlKey', function () { return modifiers.ctrl === true; });
          defineGetter(oEvent, 'altKey', function () { return modifiers.alt === true; });
        }

        var canBubble = true;
        var cancellable = true;
        var ctrlKey = modifiers.ctrl === true;
        var altKey = modifiers.alt === true;
        var shiftKey = modifiers.shift === true;
        var metaKey = modifiers.meta === true;

        if (oEvent.initKeyboardEvent) {
          oEvent.initKeyboardEvent(type, canBubble, cancellable, doc.dom().defaultView, ctrlKey, altKey, shiftKey, metaKey, value, value);
        } else {
          oEvent.initKeyEvent(type, canBubble, cancellable, doc.dom().defaultView, ctrlKey, altKey, shiftKey, metaKey, value, type === 'keypress' && platform.browser.isFirefox() ? value : 0);
        }

        dispatcher.dom().dispatchEvent(oEvent);
      }
    };

    var safari = function (type, doc, value, modifiers, dispatcher) {
      var oEvent = doc.dom().createEvent('Events');
      oEvent.initEvent(type, true, true);

      oEvent.which = value;
      oEvent.keyCode = value;
      oEvent.shiftKey = modifiers.shift === true;
      oEvent.ctrlKey = modifiers.ctrl === true;
      oEvent.metaKey = modifiers.meta === true;
      oEvent.altKey = modifiers.alt === true;

      dispatcher.dom().dispatchEvent(oEvent);
    };

    return {
      keyevent: keyevent
    };
  }
);
