asynctest(
  'browser.tinymce.core.util.DelayTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Delay'
  ],
  function (LegacyUnit, Pipeline, Delay) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    var ok = function (value, label) {
      return LegacyUnit.equal(value, true, label);
    };

    suite.asyncTest('requestAnimationFrame', function (_, done) {
      Delay.requestAnimationFrame(function () {
        ok(true, "requestAnimationFrame was executed.");
        done();
      });
    });

    suite.asyncTest('setTimeout', function (_, done) {
      Delay.setTimeout(function () {
        ok(true, "setTimeout was executed.");
        done();
      });
    });

    suite.asyncTest('setInterval', function (_, done) {
      var count = 0, id;

      id = Delay.setInterval(function () {
        if (++count === 2) {
          Delay.clearInterval(id);
          LegacyUnit.equal(count, 2);
          done();
        } else if (count > 3) {
          throw new Error("Still executing setInterval.");
        }
      });
    });

    suite.asyncTest('setEditorTimeout', function (_, done) {
      var fakeEditor = {};

      Delay.setEditorTimeout(fakeEditor, function () {
        ok(true, "setEditorTimeout was executed.");
        done();
      });
    });

    suite.test('setEditorTimeout (removed)', function () {
      var fakeEditor = { removed: true };

      Delay.setEditorTimeout(fakeEditor, function () {
        throw new Error("Still executing setEditorTimeout.");
      });

      ok(true, "setEditorTimeout on removed instance.");
    });

    suite.asyncTest('setEditorInterval', function (_, done) {
      var count = 0, id, fakeEditor = {};

      id = Delay.setEditorInterval(fakeEditor, function () {
        if (++count === 2) {
          Delay.clearInterval(id);
          LegacyUnit.equal(count, 2);
          done();
        } else if (count > 3) {
          throw new Error("Still executing setEditorInterval.");
        }
      });
    });

    suite.test('setEditorInterval (removed)', function () {
      var fakeEditor = { removed: true };

      Delay.setEditorInterval(fakeEditor, function () {
        throw new Error("Still executing setEditorInterval.");
      });

      ok(true, "setEditorTimeout on removed instance.");
    });

    suite.asyncTest('throttle', function (_, done) {
      var fn, args = [];

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
      var fn, args = [];

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
      var id;

      id = Delay.setTimeout(function () {
        throw new Error("clearTimeout didn't work.");
      });

      Delay.clearTimeout(id);
      ok(true, "clearTimeout works.");
    });

    suite.test('clearTimeout', function () {
      var id;

      id = Delay.setInterval(function () {
        throw new Error("clearInterval didn't work.");
      });

      Delay.clearInterval(id);
      ok(true, "clearInterval works.");
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
