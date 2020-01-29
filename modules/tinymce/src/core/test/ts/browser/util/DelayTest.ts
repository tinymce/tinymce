import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Delay from 'tinymce/core/api/util/Delay';
import { UnitTest } from '@ephox/bedrock-client';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.util.DelayTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  const ok = function (value, label) {
    return LegacyUnit.equal(value, true, label);
  };

  suite.asyncTest('requestAnimationFrame', function (_, done) {
    Delay.requestAnimationFrame(function () {
      ok(true, 'requestAnimationFrame was executed.');
      done();
    });
  });

  suite.asyncTest('setTimeout', function (_, done) {
    Delay.setTimeout(function () {
      ok(true, 'setTimeout was executed.');
      done();
    });
  });

  suite.asyncTest('setInterval', function (_, done) {
    let count = 0, id;

    id = Delay.setInterval(function () {
      if (++count === 2) {
        Delay.clearInterval(id);
        LegacyUnit.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setInterval.');
      }
    });
  });

  suite.asyncTest('setEditorTimeout', function (_, done) {
    const fakeEditor = {} as Editor;

    Delay.setEditorTimeout(fakeEditor, function () {
      ok(true, 'setEditorTimeout was executed.');
      done();
    });
  });

  suite.test('setEditorTimeout (removed)', function () {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorTimeout(fakeEditor, function () {
      throw new Error('Still executing setEditorTimeout.');
    });

    ok(true, 'setEditorTimeout on removed instance.');
  });

  suite.asyncTest('setEditorInterval', function (_, done) {
    let count = 0, id;
    const fakeEditor = {} as Editor;

    id = Delay.setEditorInterval(fakeEditor, function () {
      if (++count === 2) {
        Delay.clearInterval(id);
        LegacyUnit.equal(count, 2);
        done();
      } else if (count > 3) {
        throw new Error('Still executing setEditorInterval.');
      }
    });
  });

  suite.test('setEditorInterval (removed)', function () {
    const fakeEditor = { removed: true } as Editor;

    Delay.setEditorInterval(fakeEditor, function () {
      throw new Error('Still executing setEditorInterval.');
    });

    ok(true, 'setEditorTimeout on removed instance.');
  });

  suite.asyncTest('throttle', function (_, done) {
    let fn;
    const args = [];

    fn = Delay.throttle(function (a) {
      args.push(a);
    }, 0);

    fn(1);
    fn(2);

    Delay.setTimeout(function () {
      LegacyUnit.deepEqual(args, [2]);
      done();
    }, 10);
  });

  suite.asyncTest('throttle stop', function (_, done) {
    let fn;
    const args = [];

    fn = Delay.throttle(function (a) {
      args.push(a);
    }, 0);

    fn(1);
    fn.stop();

    Delay.setTimeout(function () {
      LegacyUnit.deepEqual(args, []);
      done();
    }, 10);
  });

  suite.test('clearTimeout', function () {
    let id;

    id = Delay.setTimeout(function () {
      throw new Error('clearTimeout didn\'t work.');
    });

    Delay.clearTimeout(id);
    ok(true, 'clearTimeout works.');
  });

  suite.test('clearTimeout', function () {
    let id;

    id = Delay.setInterval(function () {
      throw new Error('clearInterval didn\'t work.');
    });

    Delay.clearInterval(id);
    ok(true, 'clearInterval works.');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
