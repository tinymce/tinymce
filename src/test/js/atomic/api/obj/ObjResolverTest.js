test(
  'ObjResolverTest',

  [
    'ephox.katamari.api.ObjResolver'
  ],

  function (ObjResolver) {
    var testNamespace = function () {
      var survivor = 'i want to survive this namespacing';
      var token = 'i should be set as the [token] attribute on the namespace';

      var data = {
        foo: {
          barney: survivor
        },
        dodgy: undefined,
        didgy: null
      };

      var run = function (path, target) {
        var r = ObjResolver.namespace(path, target);
        r.token = token;
      };

      run('foo.bar.baz', data);
      assert.eq(token, data.foo.bar.baz.token);
      assert.eq(survivor, data.foo.barney);

      run('dodgy.bar.baz', data);
      assert.eq(token, data.dodgy.bar.baz.token);

      run('didgy.bar.baz', data);
      assert.eq(token, data.didgy.bar.baz.token);
    };

    var testResolve = function () {
      var check = function (expected, path, scope) {
        var actual = ObjResolver.resolve(path, scope);
        assert.eq(expected, actual);
      };

      var data = {
        a: {
          apple: {
            red: 'i am a red apple',
            green: 'i am a green apple'
          }
        },
        b: {
          banana: {
            yellow: 'i am a yellow banana'
          }
        }
      };

      check(data.a.apple.red, 'a.apple.red', data);
      check(data.a.apple.green, 'a.apple.green', data);
      check(data.b.banana.yellow, 'b.banana.yellow', data);

      check(undefined, 'c', data);
      check(undefined, 'c.carrot', data);
      check(undefined, 'c.carrot.orange', data);
    };

    testNamespace();
    testResolve();
  }
);