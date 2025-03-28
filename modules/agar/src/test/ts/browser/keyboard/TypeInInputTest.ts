import { Assert, describe, it } from '@ephox/bedrock-client';
import { DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as TestStore from 'ephox/agar/api/TestStore';
import * as UiControls from 'ephox/agar/api/UiControls';

interface InputStoreDataItem {
  readonly type: 'beforeinput' | 'input';
  readonly inputType: string;
  readonly data: string;
}

interface KeyboardStoreDataItem {
  readonly type: 'keydown' | 'keypress' | 'keyup';
  readonly which: number;
  readonly key: string;
  readonly code: string;
  readonly keyCode: number;
  readonly charCode: number;
  readonly shiftKey: boolean;
}

type StoreDataItem = InputStoreDataItem | KeyboardStoreDataItem;

describe('browser.agar.keyboard.TypeInInputTest', () => {
  const pTestOnTag = async (tagHtml: string) => {
    const store = TestStore.TestStore<StoreDataItem>();

    const input = SugarElement.fromHtml<HTMLInputElement | HTMLTextAreaElement>(tagHtml);
    Insert.append(SugarBody.body(), input);

    DomEvent.bind(input, 'keydown', ({ raw, kill }) => {
      if (raw.code === 'KeyD') {
        kill();
      }

      store.add({
        type: 'keydown',
        which: raw.which,
        key: raw.key,
        code: raw.code,
        keyCode: raw.keyCode,
        charCode: raw.charCode,
        shiftKey: raw.shiftKey
      });
    });
    DomEvent.bind(input, 'keypress', ({ raw, kill }) => {
      if (raw.code === 'KeyE') {
        kill();
      }

      store.add({
        type: 'keypress',
        which: raw.which,
        key: raw.key,
        code: raw.code,
        keyCode: raw.keyCode,
        charCode: raw.charCode,
        shiftKey: raw.shiftKey
      });
    });
    DomEvent.bind(input, 'beforeinput', ({ raw, kill }) => {
      if (raw.data === 'f') {
        kill();
      }

      store.add({ type: 'beforeinput', inputType: raw.inputType, data: raw.data });
    });
    DomEvent.bind<InputEvent>(input, 'input', ({ raw }) => store.add({ type: 'input', inputType: raw.inputType, data: raw.data }));
    DomEvent.bind(input, 'keyup', ({ raw }) => {
      store.add({
        type: 'keyup',
        which: raw.which,
        key: raw.key,
        code: raw.code,
        keyCode: raw.keyCode,
        charCode: raw.charCode,
        shiftKey: raw.shiftKey
      });
    });

    await UiControls.pType(input, 'aBcdef');
    Assert.eq('Should be expected input value d, e, f is prevented', 'aBc', UiControls.getValue(input));

    store.assertEq('Should have correct events', [
      { type: 'keydown', which: 65, key: 'a', code: 'KeyA', keyCode: 65, charCode: 0, shiftKey: false },
      { type: 'keypress', which: 97, key: 'a', code: 'KeyA', keyCode: 97, charCode: 97, shiftKey: false },
      { type: 'beforeinput', inputType: 'insertText', data: 'a' },
      { type: 'input', inputType: 'insertText', data: 'a' },
      { type: 'keyup', which: 65, key: 'a', code: 'KeyA', keyCode: 65, charCode: 0, shiftKey: false },
      { type: 'keydown', which: 66, key: 'B', code: 'KeyB', keyCode: 66, charCode: 0, shiftKey: true },
      { type: 'keypress', which: 66, key: 'B', code: 'KeyB', keyCode: 66, charCode: 66, shiftKey: true },
      { type: 'beforeinput', inputType: 'insertText', data: 'B' },
      { type: 'input', inputType: 'insertText', data: 'B' },
      { type: 'keyup', which: 66, key: 'B', code: 'KeyB', keyCode: 66, charCode: 0, shiftKey: true },
      { type: 'keydown', which: 67, key: 'c', code: 'KeyC', keyCode: 67, charCode: 0, shiftKey: false },
      { type: 'keypress', which: 99, key: 'c', code: 'KeyC', keyCode: 99, charCode: 99, shiftKey: false },
      { type: 'beforeinput', inputType: 'insertText', data: 'c' },
      { type: 'input', inputType: 'insertText', data: 'c' },
      { type: 'keyup', which: 67, key: 'c', code: 'KeyC', keyCode: 67, charCode: 0, shiftKey: false },
      { type: 'keydown', which: 68, key: 'd', code: 'KeyD', keyCode: 68, charCode: 0, shiftKey: false },
      { type: 'keydown', which: 69, key: 'e', code: 'KeyE', keyCode: 69, charCode: 0, shiftKey: false },
      { type: 'keypress', which: 101, key: 'e', code: 'KeyE', keyCode: 101, charCode: 101, shiftKey: false },
      { type: 'keydown', which: 70, key: 'f', code: 'KeyF', keyCode: 70, charCode: 0, shiftKey: false },
      { type: 'keypress', which: 102, key: 'f', code: 'KeyF', keyCode: 102, charCode: 102, shiftKey: false },
      { type: 'beforeinput', inputType: 'insertText', data: 'f' }
    ]);

    Remove.remove(input);
  };

  const pTestOnTagFail = async (tagHtml: string) => {
    const input = SugarElement.fromHtml<HTMLInputElement | HTMLTextAreaElement>(tagHtml);

    try {
      await UiControls.pType(input, 'abcde');
      Assert.fail('Should fail on input');
    } catch (e) {
      Assert.eq('Should be expected error', 'Element does not have text selection properties', e.message);
    }

    Remove.remove(input);
  };

  it('TINY-11986: Typing in an input element', () => pTestOnTag('<input type="text">'));
  it('TINY-11986: Typing in a textarea element', () => pTestOnTag('<textarea></textarea>'));
  it('TINY-11986: Typing in a non text element should fail', () => pTestOnTagFail('<input type="button"></button>'));
  it('TINY-11986: Typing on element using selector', async () => {
    const input = SugarElement.fromHtml<HTMLInputElement>('<input type="text">');
    const container = SugarElement.fromTag('div');
    Insert.append(container, input);
    Insert.append(SugarBody.body(), container);

    await UiControls.pTypeOn(container, 'input', 'abc');
    Assert.eq('Should be expected input value', 'abc', UiControls.getValue(input));

    Remove.remove(container);
  });
});

