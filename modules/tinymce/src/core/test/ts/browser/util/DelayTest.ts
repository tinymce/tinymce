import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

describe('browser.tinymce.core.util.DelayTest', () => {
  it('requestAnimationFrame', (done) => {
    Delay.requestAnimationFrame(() => {
      assert.ok(true, 'requestAnimationFrame was executed.');
      done();
    });
  });

  it('setTimeout', (done) => {
    Delay.setTimeout(() => {
      assert.ok(true, 'setTimeout was executed.');
      done();
    });
  });

  it('setInterval', (done) => {
    let count = 0;

    const id = Delay.setInterval(() => {
      if (++count === 2) {
        Delay.clearInterval(id);
        assert.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setInterval.');
      }
    });
  });

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
        Delay.clearInterval(id);
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

  it('throttle', (done) => {
    const args: number[] = [];

    const fn = Delay.throttle((a) => {
      args.push(a);
    }, 0);

    fn(1);
    fn(2);

    Delay.setTimeout(() => {
      assert.deepEqual(args, [ 2 ]);
      done();
    }, 10);
  });

  it('throttle stop', (done) => {
    const args: number[] = [];

    const fn = Delay.throttle((a) => {
      args.push(a);
    }, 0);

    fn(1);
    fn.stop();

    Delay.setTimeout(() => {
      assert.deepEqual(args, []);
      done();
    }, 10);
  });

  it('clearTimeout', () => {
    const id = Delay.setTimeout(() => {
      throw new Error(`clearTimeout didn't work.`);
    });

    Delay.clearTimeout(id);
    assert.ok(true, 'clearTimeout works.');
  });

  it('clearInterval', () => {
    const id = Delay.setInterval(() => {
      throw new Error(`clearInterval didn't work.`);
    });

    Delay.clearInterval(id);
    assert.ok(true, 'clearInterval works.');
  });
});
