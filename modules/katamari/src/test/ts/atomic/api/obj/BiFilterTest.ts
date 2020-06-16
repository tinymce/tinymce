import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';
import fc from 'fast-check';

UnitTest.test('BiFilterTest', () => {
  const even = (x) => x % 2 === 0;

  const check = (trueObj, falseObj, input, f) => {
    const filtered = Obj.bifilter(input, f);
    Assert.eq('eq', trueObj, filtered.t);
    Assert.eq('eq', falseObj, filtered.f);
  };

  check({}, { a: '1' }, { a: '1' }, even);
  check({ b: '2' }, {}, { b: '2' }, even);
  check({ b: '2' }, { a: '1' }, { a: '1', b: '2' }, even);
  check({ b: '2', d: '4' }, { a: '1', c: '3' }, { a: '1', b: '2', c: '3', d: '4' }, even);
});

UnitTest.test('Check that if the filter always returns false, then everything is in "f"', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.string(1, 40)),
    (obj) => {
      const output = Obj.bifilter(obj, Fun.constant(false));
      Assert.eq('eq', Obj.keys(obj).length, Obj.keys(output.f).length);
      Assert.eq('eq', 0, Obj.keys(output.t).length);
      return true;
    }
  ));
});

UnitTest.test('Check that if the filter always returns true, then everything is in "t"', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(), fc.string(1, 40)),
    (obj) => {
      const output = Obj.bifilter(obj, Fun.constant(true));
      Assert.eq('eq', 0, Obj.keys(output.f).length);
      Assert.eq('eq', Obj.keys(obj).length, Obj.keys(output.t).length);
      return true;
    }
  ));
});

UnitTest.test('Check that everything in f fails predicate and everything in t passes predicate', () => {
  fc.assert(fc.property(
    fc.dictionary(fc.asciiString(1, 30), fc.integer()),
    (obj) => {
      const predicate = (x) => x % 2 === 0;
      const output = Obj.bifilter(obj, predicate);

      const matches = (k) => predicate(obj[k]);

      const falseKeys = Obj.keys(output.f);
      const trueKeys = Obj.keys(output.t);

      Assert.eq('Something in "f" passed predicate', false, Arr.exists(falseKeys, matches));
      Assert.eq('Something in "t" failed predicate', true, Arr.forall(trueKeys, matches));
    }
  ));
});
