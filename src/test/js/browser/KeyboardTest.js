asynctest(
  'KeyboardTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.agar.test.DomContainers',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Focus'
  ],
 
  function (Assertions, FocusTools, Guard, Keyboard, Keys, Pipeline, Step, Waiter, DomContainers, DomEvent, Element, Focus) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sAssertEvent = function (type, code, modifiers, raw) {
      return Assertions.sAssertEq(
       'Checking ' + type + ' event',
        {
          which: code,
          ctrlKey: modifiers.ctrl || false,
          shiftKey: modifiers.shift || false,
          altKey: modifiers.alt || false,
          metaKey: modifiers.meta || false,
          type: type
        }, {
          which: raw.which,
          ctrlKey: raw.ctrlKey,
          shiftKey: raw.shiftKey,
          altKey: raw.altKey,
          metaKey: raw.metaKey,
          type: raw.type
        }
      );
    };

    var listenOn = function (type, f, code, modifiers) {
      return Step.control(
        Step.stateful(function (value, next, die) {
          var listener = DomEvent.bind(value.container, type, function (event) {
            var raw = event.raw();
            listener.unbind();

            sAssertEvent(type, code, modifiers, raw)(value, next, die);          
          });

          f(Element.fromDom(document), code, modifiers)(value, function () { }, die);
        }),
        Guard.timeout('Key event did not fire in time: ' + type, 1000)
      );
    };

    var listenOnKeystroke = function (code, modifiers) {
      return Step.control(
        Step.stateful(function (value, next, die) {
          var keydownListener = DomEvent.bind(value.container, 'keydown', function (dEvent) {
            keydownListener.unbind();
            
            var keyupListener = DomEvent.bind(value.container, 'keyup', function (uEvent) {
              keyupListener.unbind();
              
              Pipeline.async({}, [
                sAssertEvent('keydown', code, modifiers, dEvent.raw()),
                sAssertEvent('keyup', code, modifiers, uEvent.raw())
              ], function () {
                next(value);
              }, die);
            });
          });

          Keyboard.sKeystroke(Element.fromDom(document), code, modifiers)(value, function () { }, die);
        }),
        Guard.timeout('keystroke (keydown + keyup) did not fire', 1000)
      );
    };

    Pipeline.async({}, [
      DomContainers.mSetup,
      Step.stateful(function (state, next, die) {
        Focus.focus(state.container);
        next(state);
      }),
      listenOn('keydown', Keyboard.sKeydown, Keys.space(), { }),
      listenOn('keyup', Keyboard.sKeyup, Keys.space(), { }),
      listenOn('keypress', Keyboard.sKeypress, Keys.space(), { }),

      // Test one of the fakeKeys direct calls
      listenOn('keydown', function (doc, code, modifiers) {
        return Step.sync(function () {
          var focused = Focus.active(doc).getOrDie();
          Keyboard.keydown(code, modifiers, focused);
        });
      }, Keys.space(), { ctrlKey: true }),

      listenOnKeystroke(Keys.space(), { }),
      DomContainers.mTeardown
    ], function () {
      success();
    }, failure);
 

  }
);