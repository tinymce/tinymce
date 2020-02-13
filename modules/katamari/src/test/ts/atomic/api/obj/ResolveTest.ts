import * as Resolve from 'ephox/katamari/api/Resolve';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Resolve.namespace', function () {
  const survivor = 'i want to survive this namespacing';
  const token = 'i should be set as the [token] attribute on the namespace';

  const data: any = {
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
  Assert.eq('eq', token, data.foo.bar.baz.token);
  Assert.eq('eq', survivor, data.foo.barney);

  run('dodgy.bar.baz', data);
  Assert.eq('eq', token, data.dodgy.bar.baz.token);

  run('didgy.bar.baz', data);
  Assert.eq('eq', token, data.didgy.bar.baz.token);
});

UnitTest.test('Resolve.resolve', () => {
  const check = function (expected, path, scope) {
    const actual = Resolve.resolve(path, scope);
    Assert.eq('eq', expected, actual);
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
});

UnitTest.test('Checking that creating a namespace (forge) from an obj will enable that value to be retrieved by resolving (path)', () => {
  fc.assert(fc.property(
    // NOTE: This value is being modified, so it cannot be shrunk.
    fc.dictionary(fc.asciiString(),
      // We want to make sure every path in the object is an object
      // also, because that is a limitation of forge.
      fc.dictionary(fc.asciiString(),
        fc.dictionary(fc.asciiString(), fc.constant({}))
      )
    ),
    fc.array(fc.asciiString(1, 30), 1, 40),
    fc.asciiString(1, 30),
    fc.asciiString(1, 30),
    function (dict, parts, field, newValue) {
      const created = Resolve.forge(parts, dict);
      created[field] = newValue;
      const resolved = Resolve.path(parts.concat([ field ]), dict);
      Assert.eq(
        'Checking that namespace works with resolve',
        newValue,
        resolved
      );
    }
  ), { endOnFailure: true });
});
