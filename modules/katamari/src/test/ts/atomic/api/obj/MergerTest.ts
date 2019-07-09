import * as Arr from 'ephox/katamari/api/Arr';
import * as Merger from 'ephox/katamari/api/Merger';
import * as Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Merger', function () {
  assert.eq({}, Merger.merge({}, {}));
  assert.eq({a: 'A'}, Merger.merge({a: 'A'}, {}));
  assert.eq({a: 'A'}, Merger.merge({a: 'A'}, {}, {}));
  assert.eq({a: 'A'}, Merger.merge({a: 'A'}, {}, {}));
  assert.eq({a: 'A'}, Merger.merge({}, {a: 'A'},  {}));
  assert.eq({a: 'A'}, Merger.merge({},  {}, {a: 'A'}));

  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({}, { a: 'A', b: { bb: 'BB' } }));
  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'B' }}, { a: 'A', b: { bb: 'BB' }}));
  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));
  assert.eq({a: 'A', b: { bb: 'BB' }}, Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }));

  assert.eq({
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

  assert.eq({
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

  Jsc.property('Merged with identity on left', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.merge({}, obj));
  });

  Jsc.property('Merged with identity on right', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.merge(obj, {}));
  });

  Jsc.property('Merged with itself is itself', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.merge(obj, obj));
  });

  Jsc.property('Merge(a, Merge(b, c)) === Merge(Merge(a, b), c)', Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), function (a, b, c) {
    const one = Merger.merge(a, Merger.merge(b, c));
    const other = Merger.merge(Merger.merge(a, b), c);
    return Jsc.eq(one, other);
  });

  Jsc.property('Merge(a, b) contains all the keys of b', Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), function (a, b) {
    const output = Merger.merge(a, b);
    const keys = Obj.keys(b);
    const oKeys = Obj.keys(output);
    return Arr.forall(keys, function (k) {
      return Arr.contains(oKeys, k);
    });
  });

  Jsc.property('Deep-merged with identity on left', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.deepMerge({}, obj));
  });

  Jsc.property('Deep-merged with identity on right', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.deepMerge(obj, {}));
  });

  Jsc.property('Deep-merged with itself is itself', Jsc.dict(Jsc.json), function (obj) {
    return Jsc.eq(obj, Merger.deepMerge(obj, obj));
  });

  Jsc.property('Deep-merge(a, Deep-merge(b, c)) === Deep-merge(Deep-merge(a, b), c)', Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), function (a, b, c) {
    const one = Merger.merge(a, Merger.merge(b, c));
    const other = Merger.merge(Merger.merge(a, b), c);
    return Jsc.eq(one, other);
  });

  Jsc.property('Deep-merge(a, b) contains all the keys of b', Jsc.dict(Jsc.json), Jsc.dict(Jsc.json), function (a, b) {
    const output = Merger.deepMerge(a, b);
    const keys = Obj.keys(b);
    const oKeys = Obj.keys(output);
    return Arr.forall(keys, function (k) {
      return Arr.contains(oKeys, k);
    });
  });
});
