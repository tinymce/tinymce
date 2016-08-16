test(
  'namespace test',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {
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
      var r = Namespace.namespace(path, target);
      r.token = token;
    };

    run('foo.bar.baz', data);
    assert.eq(token, data.foo.bar.baz.token);
    assert.eq(survivor, data.foo.barney);

    run('dodgy.bar.baz', data);
    assert.eq(token, data.dodgy.bar.baz.token);

    run('didgy.bar.baz', data);
    assert.eq(token, data.didgy.bar.baz.token);

  }
);