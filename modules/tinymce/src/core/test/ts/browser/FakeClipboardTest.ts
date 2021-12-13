import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FakeClipboard from 'tinymce/core/api/FakeClipboard';

describe('browser.tinymce.core.FakeClipboardTest', () => {
  TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('fake clipboard returns undefined when not set', () => {
    assert.isUndefined(FakeClipboard.read());
  });

  it('can write to and read from fake clipboard', () => {
    FakeClipboard.write('hello');
    assert.equal(FakeClipboard.read(), 'hello');
  });

  it('can clear fake clipboard after being written to', () => {
    FakeClipboard.write('hello');
    assert.equal(FakeClipboard.read(), 'hello');
    FakeClipboard.clear();
    assert.isUndefined(FakeClipboard.read());
  });

  it('can store an object', () => {
    const testObj = {
      a: 1,
      b: 2
    };
    FakeClipboard.write(testObj);
    assert.deepEqual(FakeClipboard.read(), testObj);
  });
});
