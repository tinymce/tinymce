import * as Arr from 'ephox/katamari/api/Arr';
import * as Merger from 'ephox/katamari/api/Merger';
import * as Obj from 'ephox/katamari/api/Obj';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Merger', function () {
  Assert.eq('eq', {}, Merger.merge({}, {}));
  Assert.eq('eq', {a: 'A'}, Merger.merge({a: 'A'}, {}));
  Assert.eq('eq', {a: 'A'}, Merger.merge({a: 'A'}, {}, {}));
  Assert.eq('eq', {a: 'A'}, Merger.merge({a: 'A'}, {}, {}));
  Assert.eq('eq', {a: 'A'}, Merger.merge({}, {a: 'A'},  {}));
  Assert.eq('eq', {a: 'A'}, Merger.merge({},  {}, {a: 'A'}));

  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({}, { a: 'A', b: { bb: 'BB' } }));
  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'B' }}, { a: 'A', b: { bb: 'BB' }}));
  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  Assert.eq('eq', {a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));

  Assert.eq('eq', {
    a: 'A',
    b: {
      bb: 'BB',
      bc: [1, 'bc'],
      bd: {
        bdd: 'BDBD'
      }
    }
  }, Merger.merge({
    a: 'A'
  }, {
    b: {
      ba: 'BA'
    }
  }, {
    b: {
      bb: 'BB',
      bc: [1, 'bc'],
      bd: {
        bdd: 'BDBD'
      }
    }
  }));

  Assert.eq('eq', {
    a: 'A',
    b: {
      ba: 'BA',
      bb: 'BB',
      bc: [1, 'bc'],
      bd: {
        bdd: 'BDBD'
      }
    }
  }, Merger.deepMerge({
    a: 'A'
  }, {
    b: {
      ba: 'BA'
    }
  }, {
    b: {
      bb: 'BB',
      bc: [1, 'bc'],
      bd: {
        bdd: 'BDBD'
      }
    }
  }));
});

UnitTest.test('Merged with identity on left', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.merge({}, obj));
  }));
});

UnitTest.test('Merged with identity on right', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.merge(obj, {}));
  }));
});

UnitTest.test('Merged with itself is itself', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.merge(obj, obj));
  }));
});

UnitTest.test('Merge(a, Merge(b, c)) === Merge(Merge(a, b), c)', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), function (a, b, c) {
    const one = Merger.merge(a, Merger.merge(b, c));
    const other = Merger.merge(Merger.merge(a, b), c);
    Assert.eq('eq',  one, other);
  }));
});

UnitTest.test('Merge(a, b) contains all the keys of b', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), function (a, b) {
    const output = Merger.merge(a, b);
    const keys = Obj.keys(b);
    const oKeys = Obj.keys(output);
    return Arr.forall(keys, function (k) {
      return Arr.contains(oKeys, k);
    });
  }));
});

UnitTest.test('Deep-merged with identity on left', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.deepMerge({}, obj));
  }));
});

UnitTest.test('Deep-merged with identity on right', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.deepMerge(obj, {}));
  }));
});

UnitTest.test('Deep-merged with itself is itself', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), function (obj) {
    Assert.eq('eq',  obj, Merger.deepMerge(obj, obj));
  }));
});

UnitTest.test('Deep-merge(a, Deep-merge(b, c)) === Deep-merge(Deep-merge(a, b), c)', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), function (a, b, c) {
    const one = Merger.merge(a, Merger.merge(b, c));
    const other = Merger.merge(Merger.merge(a, b), c);
    Assert.eq('eq',  one, other);
  }));
});

UnitTest.test('Deep-merge(a, b) contains all the keys of b', () => {
  fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), function (a, b) {
    const output = Merger.deepMerge(a, b);
    const keys = Obj.keys(b);
    const oKeys = Obj.keys(output);
    return Arr.forall(keys, function (k) {
      return Arr.contains(oKeys, k);
    });
  }));
});
