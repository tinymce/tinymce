import * as Resolve from 'ephox/katamari/api/Resolve';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ObjResolverTest', function() {
  const testNamespace = function () {
    const survivor = 'i want to survive this namespacing';
    const token = 'i should be set as the [token] attribute on the namespace';

    const data:any = {
      foo: {
        barney: survivor
      },
      dodgy: undefined,
      didgy: null
    };

    const run = function (path, target) {
      const r = Resolve.namespace(path, target);
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

  const testResolve = function () {
    const check = function (expected, path, scope) {
      const actual = Resolve.resolve(path, scope);
      assert.eq(expected, actual);
    };

    const data = {
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

    check(parseInt, 'parseInt', null);
  };

  const testSpecs = function () {
    const checkEq = function (label, expected, actual) {
      return Jsc.eq(expected, actual) ? true : label + '. Exp: ' + expected + ', actual: ' + actual;
    };

    Jsc.property(
      'Checking that creating a namespace (forge) from an obj will enable that value to be retrieved by resolving (path)',
      // NOTE: This value is being modified, so it cannot be shrunk.
      Jsc.nonshrink(Jsc.dict(
        // We want to make sure every path in the object is an object
        // also, because that is a limitation of forge.
        Jsc.dict(
          Jsc.dict(Jsc.constant({}))
        )
      )),
      Jsc.nearray(Jsc.asciinestring),
      Jsc.asciinestring,
      Jsc.asciinestring,
      function (dict, parts, field, newValue) {
        const created = Resolve.forge(parts, dict);
        created[field] = newValue;
        const resolved = Resolve.path(parts.concat([ field ]), dict);
        return checkEq(
          'Checking that namespace works with resolve',
          newValue,
          resolved
        );
      }
    );
  };

  testNamespace();
  testResolve();
  testSpecs();
});

