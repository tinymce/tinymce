import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FakeClipboard, { FakeClipboardItem } from 'tinymce/core/api/FakeClipboard';

describe('browser.tinymce.core.FakeClipboardTest', () => {
  TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  afterEach(() => {
    FakeClipboard.clear();
  });

  it('TINY-8353: fake clipboard returns undefined when not set', () => {
    assert.isUndefined(FakeClipboard.read());
  });

  it('TINY-8353: can create a FakeClipboardItem', () => {
    const data = {
      text: 'This is text',
      test: 1
    };

    const item = FakeClipboard.FakeClipboardItem(data);
    assert.deepEqual(item.types, [ 'text', 'test' ]);
    assert.deepEqual(item.items, data);
    assert.equal(item.getType('text'), 'This is text');
    assert.equal(item.getType('test'), 1);
    assert.isUndefined(item.getType('noexist'));
  });

  it('TINY-8353: can write to and read from fake clipboard', () => {
    const item = FakeClipboard.FakeClipboardItem({
      text: 'hello',
    });
    FakeClipboard.write([ item ]);

    const clipboardItems = FakeClipboard.read() as FakeClipboardItem[];
    assert.lengthOf(clipboardItems, 1);
    assert.equal(clipboardItems[0].getType('text'), 'hello');
  });

  it('TINY-8353: can write to and read multiple clipboard items', () => {
    FakeClipboard.write([
      FakeClipboard.FakeClipboardItem({ text: 'item1' }),
      FakeClipboard.FakeClipboardItem({ text: 'item2' }),
    ]);

    const clipboardItems = FakeClipboard.read() as FakeClipboardItem[];
    assert.lengthOf(clipboardItems, 2);
    assert.equal(clipboardItems[0].getType('text'), 'item1');
    assert.equal(clipboardItems[1].getType('text'), 'item2');
  });

  it('TINY-8353: can clear fake clipboard after being written to', () => {
    const item = FakeClipboard.FakeClipboardItem({
      text: 'hello',
    });
    FakeClipboard.write([ item ]);

    const clipboardItems = FakeClipboard.read() as FakeClipboardItem[];
    assert.lengthOf(clipboardItems, 1);

    FakeClipboard.clear();
    assert.isUndefined(FakeClipboard.read());
  });

  it('TINY-8353: can store an object', () => {
    const testObj = {
      a: 1,
      b: 2
    };
    FakeClipboard.write([
      FakeClipboard.FakeClipboardItem({ obj: testObj })
    ]);

    const clipboardItems = FakeClipboard.read() as FakeClipboardItem[];
    assert.deepEqual(clipboardItems[0].getType('obj'), testObj);
  });
});
