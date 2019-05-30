import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { DomEvent, Element, Focus } from '@ephox/sugar';
import * as Assertions from 'ephox/agar/api/Assertions';
import * as Guard from 'ephox/agar/api/Guard';
import * as Keyboard from 'ephox/agar/api/Keyboard';
import { Keys } from 'ephox/agar/api/Keys';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import DomContainers from 'ephox/agar/test/DomContainers';
import { TestLogs } from '../../../main/ts/ephox/agar/api/Main';

UnitTest.asynctest('KeyboardTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const sAssertEvent = function (type, code, modifiers, raw) {
    return Assertions.sAssertEq(
      'Checking ' + type + ' event',
      {
        which: code,
        ctrlKey: modifiers.ctrlKey || false,
        shiftKey: modifiers.shiftKey || false,
        altKey: modifiers.altKey || false,
        metaKey: modifiers.metaKey || false,
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

  const listenOn = function (type, f, code, modifiers) {
    return Step.control(
      Step.raw(function (value: { container: any; }, next, die, logs) {
        const listener = DomEvent.bind(value.container, type, function (event) {
          const raw = event.raw();
          listener.unbind();

          sAssertEvent(type, code, modifiers, raw)(value, next, die, logs);
        });

        f(Element.fromDom(document), code, modifiers)(value, function () { }, die);
      }),
      Guard.timeout('Key event did not fire in time: ' + type, 1000)
    );
  };

  const listenOnKeystroke = function (code, modifiers) {
    return Step.control(
      Step.raw(function (value: { container: any; }, next, die, initLogs) {
        const keydownListener = DomEvent.bind(value.container, 'keydown', function (dEvent) {
          keydownListener.unbind();

          const keyupListener = DomEvent.bind(value.container, 'keyup', function (uEvent) {
            keyupListener.unbind();

            Pipeline.async({}, [
              sAssertEvent('keydown', code, modifiers, dEvent.raw()),
              sAssertEvent('keyup', code, modifiers, uEvent.raw())
            ], function (v, newLogs) {
              next(value, newLogs);
            }, die, initLogs);
          });
        });

        Keyboard.sKeystroke(Element.fromDom(document), code, modifiers)(value, function () { }, die, TestLogs.init());
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
    listenOn('keydown', Keyboard.sKeydown, Keys.space(), {}),
    listenOn('keyup', Keyboard.sKeyup, Keys.space(), {}),
    listenOn('keypress', Keyboard.sKeypress, Keys.space(), {}),

    // Test one of the fakeKeys direct calls
    listenOn('keydown', function (doc, code, modifiers) {
      return Step.sync(function () {
        const focused = Focus.active(doc).getOrDie();
        Keyboard.keydown(code, modifiers, focused);
      });
    }, Keys.space(), { ctrlKey: true }),

    listenOnKeystroke(Keys.space(), {}),
    DomContainers.mTeardown
  ], function () {
    success();
  }, failure);
});

