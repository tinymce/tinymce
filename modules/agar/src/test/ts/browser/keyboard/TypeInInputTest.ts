import { Assert, describe, it } from '@ephox/bedrock-client';
import { DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import * as TestStore from 'ephox/agar/api/TestStore';
import * as UiControls from 'ephox/agar/api/UiControls';

interface StoreDataItem {
  readonly type: string;
  readonly inputType?: string;
  readonly data: string;
}

describe('browser.agar.keyboard.TypeInInputTest', () => {
  it('TINY-11986: Typing in an input element', async () => {
    const store = TestStore.TestStore<StoreDataItem>();

    const input = SugarElement.fromHtml<HTMLInputElement>('<input type="text">');
    Insert.append(SugarBody.body(), input);

    DomEvent.bind(input, 'keydown', ({ raw, kill }) => {
      if (raw.charCode === 100) {
        kill();
      } else {
        store.add({ type: 'keydown', data: raw.charCode.toString() });
      }
    });
    DomEvent.bind(input, 'beforeinput', ({ raw, kill }) => {
      if (raw.data === 'e') {
        kill();
      } else {
        store.add({ type: 'beforeinput', inputType: raw.inputType, data: raw.data });
      }
    });
    DomEvent.bind<InputEvent>(input, 'input', ({ raw }) => store.add({ type: 'input', inputType: raw.inputType, data: raw.data }));
    DomEvent.bind(input, 'keyup', ({ raw }) => store.add({ type: 'keyup', data: raw.charCode.toString() }));

    await UiControls.pType(input, 'abcde');
    Assert.eq('Should be expected input value d and e is prevented', 'abc', UiControls.getValue(input));

    store.assertEq('Should have correct events', [
      { type: 'keydown', data: '97' },
      { type: 'beforeinput', inputType: 'insertText', data: 'a' },
      { type: 'input', inputType: 'insertText', data: 'a' },
      { type: 'keyup', data: '97' },
      { type: 'keydown', data: '98' },
      { type: 'beforeinput', inputType: 'insertText', data: 'b' },
      { type: 'input', inputType: 'insertText', data: 'b' },
      { type: 'keyup', data: '98' },
      { type: 'keydown', data: '99' },
      { type: 'beforeinput', inputType: 'insertText', data: 'c' },
      { type: 'input', inputType: 'insertText', data: 'c' },
      { type: 'keyup', data: '99' },
      { type: 'keydown', data: '101' }
    ]);

    Remove.remove(input);
  });
});

