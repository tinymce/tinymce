import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

UnitTest.asynctest('browser.tinymce.core.util.DelayTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  const ok = (value, label) => {
    return LegacyUnit.equal(value, true, label);
  };

  suite.asyncTest('requestAnimationFrame', (_, done) => {
    Delay.requestAnimationFrame(() => {
      ok(true, 'requestAnimationFrame was executed.');
      done();
    });
  });

  suite.asyncTest('setTimeout', (_, done) => {
    Delay.setTimeout(() => {
      ok(true, 'setTimeout was executed.');
      done();
    });
  });

  suite.asyncTest('setInterval', (_, done) => {
    let count = 0;

    const id = Delay.setInterval(() => {
      if (++count === 2) {
        Delay.clearInterval(id);
        LegacyUnit.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setInterval.');
      }
    });
  });

  suite.asyncTest('setEditorTimeout', (_, done) => {
    const fakeEditor = {} as Editor;

    Delay.setEditorTimeout(fakeEditor, () => {
      ok(true, 'setEditorTimeout was executed.');
      done();
    });
  });

  suite.test('setEditorTimeout (removed)', () => {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorTimeout(fakeEditor, () => {
      throw new Error('Still executing setEditorTimeout.');
    });

    ok(true, 'setEditorTimeout on removed instance.');
  });

  suite.asyncTest('setEditorInterval', (_, done) => {
    let count = 0;
    const fakeEditor = {} as Editor;

    const id = Delay.setEditorInterval(fakeEditor, () => {
      if (++count === 2) {
        Delay.clearInterval(id);
        LegacyUnit.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setEditorInterval.');
      }
    });
  });

  suite.test('setEditorInterval (removed)', () => {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorInterval(fakeEditor, () => {
      throw new Error('Still executing setEditorInterval.');
    });

    ok(true, 'setEditorTimeout on removed instance.');
  });

  suite.asyncTest('throttle', (_, done) => {
    const args = [];

    const fn = Delay.throttle((a) => {
      args.push(a);
    }, 0);

    fn(1);
    fn(2);

    Delay.setTimeout(() => {
      LegacyUnit.deepEqual(args, [ 2 ]);
      done();
    }, 10);
  });

  suite.asyncTest('throttle stop', (_, done) => {
    const args = [];

    const fn = Delay.throttle((a) => {
      args.push(a);
    }, 0);

    fn(1);
    fn.stop();

    Delay.setTimeout(() => {
      LegacyUnit.deepEqual(args, []);
      done();
    }, 10);
  });

  suite.test('clearTimeout', () => {
    const id = Delay.setTimeout(() => {
      throw new Error(`clearTimeout didn't work.`);
    });

    Delay.clearTimeout(id);
    ok(true, 'clearTimeout works.');
  });

  suite.test('clearTimeout', () => {
    const id = Delay.setInterval(() => {
      throw new Error(`clearInterval didn't work.`);
    });

    Delay.clearInterval(id);
    ok(true, 'clearInterval works.');
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
