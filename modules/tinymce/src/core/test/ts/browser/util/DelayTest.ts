import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

describe('browser.tinymce.core.util.DelayTest', () => {
  it('setEditorTimeout', (done) => {
    const fakeEditor = {} as Editor;

    Delay.setEditorTimeout(fakeEditor, () => {
      assert.ok(true, 'setEditorTimeout was executed.');
      done();
    });
  });

  it('setEditorTimeout (removed)', () => {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorTimeout(fakeEditor, () => {
      throw new Error('Still executing setEditorTimeout.');
    });

    assert.ok(true, 'setEditorTimeout on removed instance.');
  });

  it('setEditorInterval', (done) => {
    let count = 0;
    const fakeEditor = {} as Editor;

    const id = Delay.setEditorInterval(fakeEditor, () => {
      if (++count === 2) {
        clearInterval(id);
        assert.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setEditorInterval.');
      }
    });
  });

  it('setEditorInterval (removed)', () => {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorInterval(fakeEditor, () => {
      throw new Error('Still executing setEditorInterval.');
    });

    assert.ok(true, 'setEditorTimeout on removed instance.');
  });
});
