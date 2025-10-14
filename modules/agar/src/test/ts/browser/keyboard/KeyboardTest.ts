import { context, describe, it } from '@ephox/bedrock-client';
import { DomEvent, Focus, Html, Insert, Remove, SugarBody, SugarDocument, SugarElement, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import * as Keyboard from 'ephox/agar/api/Keyboard';
import { Keys } from 'ephox/agar/api/Keys';
import { TestStore } from 'ephox/agar/api/TestStore';
import type { MixedKeyModifiers } from 'ephox/agar/keyboard/FakeKeys';

describe('browser.agar.keyboard.KeyboardTest', () => {
  const pTestKeyboardEvent = (pDispatchEvent: (type: string, value: number, modifiers: MixedKeyModifiers) => Promise<KeyboardEvent>) => async (testCase: {
    type: 'keyup' | 'keydown' | 'keypress';
    value: number;
    modifiers: MixedKeyModifiers;
    expectedKeyInfo: {
      which: number;
      key: string;
      code: string;
      keyCode: number;
      charCode: number;
      shiftKey?: boolean;
      metaKey?: boolean;
      ctrlKey?: boolean;
      altKey?: boolean;
    };
  }) => {
    const event = await pDispatchEvent(testCase.type, testCase.value, testCase.modifiers);

    const defaultedExpectedKeyInfo = {
      shiftKey: false,
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      ...testCase.expectedKeyInfo
    };

    assert.equal(event.which, defaultedExpectedKeyInfo.which, 'Expected which to match');
    assert.equal(event.key, defaultedExpectedKeyInfo.key, 'Expected key to match');
    assert.equal(event.code, defaultedExpectedKeyInfo.code, 'Expected code to match');
    assert.equal(event.keyCode, defaultedExpectedKeyInfo.keyCode, 'Expected keyCode to match');
    assert.equal(event.charCode, defaultedExpectedKeyInfo.charCode, 'Expected charCode to match');
    assert.equal(event.shiftKey, defaultedExpectedKeyInfo.shiftKey, 'Expected shiftKey to match');
    assert.equal(event.metaKey, defaultedExpectedKeyInfo.metaKey, 'Expected metaKey to match');
    assert.equal(event.ctrlKey, defaultedExpectedKeyInfo.ctrlKey, 'Expected ctrlKey to match');
    assert.equal(event.altKey, defaultedExpectedKeyInfo.altKey, 'Expected altKey to match');
  };

  context('Keyup, keydown, keypress on specified element', () => {
    const pDispatchEvent = async (type: 'keydown' | 'keypress' | 'keyup', value: number, modifiers: MixedKeyModifiers) => {
      const dispatcher = SugarElement.fromTag('div');

      Insert.append(SugarBody.body(), dispatcher);

      const event = await pDispatchEventOn(type, getDispatchFunc(type), value, modifiers, dispatcher);

      Remove.remove(dispatcher);

      return event;
    };

    const pTestTargetKeyboardEvent = pTestKeyboardEvent(pDispatchEvent);

    const pDispatchEventOn = async (
      type: 'keydown' | 'keypress' | 'keyup',
      dispatchEvent: (value: number, modifiers: MixedKeyModifiers, dispatcher: SugarElement<Element>) => void,
      value: number,
      modifiers: MixedKeyModifiers,
      dispatcher: SugarElement<Element>
    ) => {
      return new Promise<KeyboardEvent>((resolve) => {
        const eventBind = DomEvent.bind(dispatcher, type, (e) => resolve(e.raw));

        dispatchEvent(value, modifiers, dispatcher);

        eventBind.unbind();
      });
    };

    const getDispatchFunc = (type: 'keydown' | 'keypress' | 'keyup'): (value: number, modifiers: MixedKeyModifiers, dispatcher: SugarElement<Node>) => void => {
      if (type === 'keydown') {
        return Keyboard.keydown;
      } else if (type === 'keypress') {
        return Keyboard.keypress;
      } else {
        return Keyboard.keyup;
      }
    };

    context('Keyup', () => {
      it('TINY-8724: Keyup (arrow up) with no modifiers', () => pTestTargetKeyboardEvent({
        type: 'keyup',
        value: Keys.up(),
        modifiers: { },
        expectedKeyInfo: {
          which: Keys.up(),
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: Keys.up(),
          charCode: 0
        }
      }));

      it('TINY-8724: Keyup (arrow up) with all modifiers', () => pTestTargetKeyboardEvent({
        type: 'keyup',
        value: Keys.up(),
        modifiers: {
          shiftKey: true,
          ctrlKey: true,
          altKey: true,
          metaKey: true
        },
        expectedKeyInfo: {
          which: Keys.up(),
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: Keys.up(),
          charCode: 0,
          shiftKey: true,
          metaKey: true,
          ctrlKey: true,
          altKey: true
        }
      }));
    });

    context('Keydown', () => {
      it('TINY-8724: Keydown (arrow up) no modifiers', () => pTestTargetKeyboardEvent({
        type: 'keydown',
        value: Keys.up(),
        modifiers: { },
        expectedKeyInfo: {
          which: Keys.up(),
          keyCode: Keys.up(),
          charCode: 0,
          key: 'ArrowUp',
          code: 'ArrowUp'
        }
      }));

      it('TINY-8724: Keydown (arrow up) with all modifiers', () => pTestTargetKeyboardEvent({
        type: 'keydown',
        value: Keys.up(),
        modifiers: {
          shiftKey: true,
          ctrlKey: true,
          altKey: true,
          metaKey: true
        },
        expectedKeyInfo: {
          which: Keys.up(),
          keyCode: Keys.up(),
          charCode: 0,
          key: 'ArrowUp',
          code: 'ArrowUp',
          shiftKey: true,
          metaKey: true,
          ctrlKey: true,
          altKey: true
        }
      }));
    });

    context('Keypress', () => {
      it('TINY-8724: Keypress (a) with no modifiers', () => pTestTargetKeyboardEvent({
        type: 'keypress',
        value: 65, // 'a'
        modifiers: { },
        expectedKeyInfo: {
          which: 97,
          keyCode: 97,
          charCode: 97,
          key: 'a',
          code: 'KeyA'
        }
      }));

      it('TINY-8724: Keypress (a) with shift modifier', () => pTestTargetKeyboardEvent({
        type: 'keypress',
        value: 65, // 'a'
        modifiers: { shiftKey: true },
        expectedKeyInfo: {
          which: 65,
          keyCode: 65,
          charCode: 65,
          key: 'A',
          code: 'KeyA',
          shiftKey: true
        }
      }));
    });
  });

  context('Keyup, keydown, keypress on focused element', () => {
    const pDispatchEventOnFocused = async (
      type: 'keydown' | 'keypress' | 'keyup',
      dispatchEvent: (doc: SugarElement<Document | ShadowRoot>, value: number, modifiers: MixedKeyModifiers) => void,
      value: number,
      modifiers: MixedKeyModifiers,
      doc: SugarElement<Document | ShadowRoot>,
      focused: SugarElement<Element>
    ) => {
      return new Promise<KeyboardEvent>((resolve) => {
        const eventBind = DomEvent.bind(focused, type, (e) => resolve(e.raw));

        dispatchEvent(doc, value, modifiers);

        eventBind.unbind();
      });
    };

    const getDispatchFuncOnFocused = (type: 'keydown' | 'keypress' | 'keyup'): (doc: SugarElement<Document | ShadowRoot>, value: number, modifiers: MixedKeyModifiers) => void => {
      if (type === 'keydown') {
        return Keyboard.activeKeydown;
      } else if (type === 'keypress') {
        return Keyboard.activeKeypress;
      } else {
        return Keyboard.activeKeyup;
      }
    };

    const pDispatchEvent = async (type: 'keydown' | 'keypress' | 'keyup', value: number, modifiers: MixedKeyModifiers) => {
      const container = SugarElement.fromTag('div');
      const focused = SugarElement.fromTag('input');

      Insert.append(container, focused);
      Insert.append(SugarBody.body(), container);
      Focus.focus(focused);

      const doc = SugarDocument.getDocument();

      const event = await pDispatchEventOnFocused(type, getDispatchFuncOnFocused(type), value, modifiers, doc, focused);

      Remove.remove(container);

      return event;
    };

    const pTestFocusKeyboardEvent = pTestKeyboardEvent(pDispatchEvent);

    context('Keyup', () => {
      it('TINY-8724: Keyup (arrow up) with no modifiers', () => pTestFocusKeyboardEvent({
        type: 'keyup',
        value: Keys.up(),
        modifiers: { },
        expectedKeyInfo: {
          which: Keys.up(),
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: Keys.up(),
          charCode: 0
        }
      }));

      it('TINY-8724: Keyup (arrow up) with all modifiers', () => pTestFocusKeyboardEvent({
        type: 'keyup',
        value: Keys.up(),
        modifiers: {
          shiftKey: true,
          ctrlKey: true,
          altKey: true,
          metaKey: true
        },
        expectedKeyInfo: {
          which: Keys.up(),
          key: 'ArrowUp',
          code: 'ArrowUp',
          keyCode: Keys.up(),
          charCode: 0,
          shiftKey: true,
          metaKey: true,
          ctrlKey: true,
          altKey: true
        }
      }));
    });

    context('Keydown', () => {
      it('TINY-8724: Keydown (arrow up) no modifiers', () => pTestFocusKeyboardEvent({
        type: 'keydown',
        value: Keys.up(),
        modifiers: { },
        expectedKeyInfo: {
          which: Keys.up(),
          keyCode: Keys.up(),
          charCode: 0,
          key: 'ArrowUp',
          code: 'ArrowUp'
        }
      }));

      it('TINY-8724: Keydown (arrow up) with all modifiers', () => pTestFocusKeyboardEvent({
        type: 'keydown',
        value: Keys.up(),
        modifiers: {
          shiftKey: true,
          ctrlKey: true,
          altKey: true,
          metaKey: true
        },
        expectedKeyInfo: {
          which: Keys.up(),
          keyCode: Keys.up(),
          charCode: 0,
          key: 'ArrowUp',
          code: 'ArrowUp',
          shiftKey: true,
          metaKey: true,
          ctrlKey: true,
          altKey: true
        }
      }));
    });

    context('Keypress', () => {
      it('TINY-8724: Keypress (a) with no modifiers', () => pTestFocusKeyboardEvent({
        type: 'keypress',
        value: 65, // 'a'
        modifiers: { },
        expectedKeyInfo: {
          which: 97,
          keyCode: 97,
          charCode: 97,
          key: 'a',
          code: 'KeyA'
        }
      }));

      it('TINY-8724: Keypress (a) with shift modifier', () => pTestFocusKeyboardEvent({
        type: 'keypress',
        value: 65, // 'a'
        modifiers: { shiftKey: true },
        expectedKeyInfo: {
          which: 65,
          keyCode: 65,
          charCode: 65,
          key: 'A',
          code: 'KeyA',
          shiftKey: true
        }
      }));
    });
  });

  context('pType', () => {
    it('TINY-8724: Types the text into specified element at selection', async () => {
      const container = SugarElement.fromHtml<HTMLElement>('<div contenteditable="true">abc</div>');
      const store = TestStore<{ type: string; data: string }>();

      Insert.append(SugarBody.body(), container);
      Focus.focus(container);
      const textNode = Traverse.firstChild(container).getOrDie('Failed to get container');

      const range = document.createRange();
      range.setStart(textNode.dom, 3);
      range.setEnd(textNode.dom, 3);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      DomEvent.bind(container, 'keydown', (e) => store.add({ type: 'keydown', data: e.raw.key }));
      DomEvent.bind(container, 'keypress', (e) => store.add({ type: 'keypress', data: e.raw.key }));
      DomEvent.bind(container, 'keyup', (e) => store.add({ type: 'keyup', data: e.raw.key }));
      DomEvent.bind(container, 'beforeinput', (e) => store.add({ type: 'beforeinput', data: e.raw.data }));
      DomEvent.bind(container, 'input', () => store.add({ type: 'input', data: '' }));

      await Keyboard.pTypeTextInElement(container, 'def');

      assert.equal(Html.get(container), 'abcdef');
      store.assertEq('Should have fired the events in the correct order', [
        { type: 'keydown', data: 'd' },
        { type: 'keypress', data: 'd' },
        { type: 'beforeinput', data: 'd' },
        { type: 'input', data: '' },
        { type: 'keyup', data: 'd' },
        { type: 'keydown', data: 'e' },
        { type: 'keypress', data: 'e' },
        { type: 'beforeinput', data: 'e' },
        { type: 'input', data: '' },
        { type: 'keyup', data: 'e' },
        { type: 'keydown', data: 'f' },
        { type: 'keypress', data: 'f' },
        { type: 'beforeinput', data: 'f' },
        { type: 'input', data: '' },
        { type: 'keyup', data: 'f' }
      ]);

      Remove.remove(container);
    });
  });
});
