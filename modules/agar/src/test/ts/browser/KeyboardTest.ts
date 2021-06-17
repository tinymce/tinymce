import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { DomEvent, Focus, SugarElement } from '@ephox/sugar';

import * as Assertions from 'ephox/agar/api/Assertions';
import * as Guard from 'ephox/agar/api/Guard';
import * as Keyboard from 'ephox/agar/api/Keyboard';
import { Keys } from 'ephox/agar/api/Keys';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import { TestLogs } from 'ephox/agar/api/TestLogs';
import * as DomContainers from 'ephox/agar/test/DomContainers';

UnitTest.asynctest('KeyboardTest', (success, failure) => {

  const sAssertEvent = (type: string, code: number, modifiers: Record<string, boolean>, raw: KeyboardEvent) => {
    const expected: Record<string, any> = {
      which: code,
      ctrlKey: modifiers.ctrlKey || false,
      shiftKey: modifiers.shiftKey || false,
      altKey: modifiers.altKey || false,
      metaKey: modifiers.metaKey || false,
      type
    };
    const actual: Record<string, any> = {
      which: raw.which,
      ctrlKey: raw.ctrlKey,
      shiftKey: raw.shiftKey,
      altKey: raw.altKey,
      metaKey: raw.metaKey,
      type: raw.type
    };
    // Keypress events should also include a charCode
    if (type === 'keypress') {
      expected.charCode = code;
      actual.charCode = raw.charCode;
    }
    return Assertions.sAssertEq('Checking ' + type + ' event', expected, actual);
  };

  const listenOn = (type, f, code, modifiers) =>
    Step.control(
      Step.raw((value: { container: any }, next, die, logs) => {
        const listener = DomEvent.bind(value.container, type, (event) => {
          const raw = event.raw;
          listener.unbind();

          sAssertEvent(type, code, modifiers, raw).runStep(value, next, die, logs);
        });

        f(SugarElement.fromDom(document), code, modifiers).runStep(value, Fun.noop, die);
      }),
      Guard.timeout('Key event did not fire in time: ' + type, 1000)
    );

  const listenOnKeystroke = (code, modifiers) => Step.control(
    Step.raw((value: { container: any }, next, die, initLogs) => {
      const keydownListener = DomEvent.bind(value.container, 'keydown', (dEvent) => {
        keydownListener.unbind();

        const keyupListener = DomEvent.bind(value.container, 'keyup', (uEvent) => {
          keyupListener.unbind();

          Pipeline.async({}, [
            sAssertEvent('keydown', code, modifiers, dEvent.raw),
            sAssertEvent('keyup', code, modifiers, uEvent.raw)
          ], (v, newLogs) => {
            next(value, newLogs);
          }, die, initLogs);
        });
      });

      Keyboard.sKeystroke(SugarElement.fromDom(document), code, modifiers).runStep(value, Fun.noop, die, TestLogs.init());
    }),
    Guard.timeout('keystroke (keydown + keyup) did not fire', 1000)
  );

  Pipeline.async({}, [
    DomContainers.mSetup,
    Step.stateful((state, next, _die) => {
      Focus.focus(state.container);
      next(state);
    }),
    listenOn('keydown', Keyboard.sKeydown, Keys.space(), {}),
    listenOn('keyup', Keyboard.sKeyup, Keys.space(), {}),
    listenOn('keypress', Keyboard.sKeypress, Keys.space(), {}),

    // Test one of the fakeKeys direct calls
    listenOn('keydown', (doc, code, modifiers) => Step.sync(() => {
      const focused = Focus.active(doc).getOrDie();
      Keyboard.keydown(code, modifiers, focused);
    }), Keys.space(), { ctrlKey: true }),

    listenOnKeystroke(Keys.space(), {}),
    DomContainers.mTeardown
  ], success, failure);
});
