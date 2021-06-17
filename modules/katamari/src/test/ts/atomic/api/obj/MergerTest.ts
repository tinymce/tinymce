import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Merger from 'ephox/katamari/api/Merger';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.MergerTest', () => {
  it('Merger', () => {
    assert.deepEqual(Merger.merge({}, {}), {});
    assert.deepEqual(Merger.merge({ a: 'A' }, {}), { a: 'A' });
    assert.deepEqual(Merger.merge({ a: 'A' }, {}, {}), { a: 'A' });
    assert.deepEqual(Merger.merge({ a: 'A' }, {}, {}), { a: 'A' });
    assert.deepEqual(Merger.merge({}, { a: 'A' }, {}), { a: 'A' });
    assert.deepEqual(Merger.merge({}, {}, { a: 'A' }), { a: 'A' });

    assert.deepEqual(Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }), { a: 'A', b: { bb: 'BB' }});
    assert.deepEqual(Merger.merge({}, { a: 'A', b: { bb: 'BB' }}), { a: 'A', b: { bb: 'BB' }});
    assert.deepEqual(Merger.merge({ b: { bb: 'B' }}, { a: 'A', b: { bb: 'BB' }}), { a: 'A', b: { bb: 'BB' }});
    assert.deepEqual(Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }), { a: 'A', b: { bb: 'BB' }});
    assert.deepEqual(Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }), { a: 'A', b: { bb: 'BB' }});
    assert.deepEqual(Merger.merge({ b: { bb: 'BB' }}, { a: 'A' }), { a: 'A', b: { bb: 'BB' }});

    assert.deepEqual(Merger.merge({
      a: 'A'
    }, {
      b: {
        ba: 'BA'
      }
    }, {
      b: {
        bb: 'BB',
        bc: [ 1, 'bc' ],
        bd: {
          bdd: 'BDBD'
        }
      }
    }), {
      a: 'A',
      b: {
        bb: 'BB',
        bc: [ 1, 'bc' ],
        bd: {
          bdd: 'BDBD'
        }
      }
    });

    assert.deepEqual(Merger.deepMerge({
      a: 'A'
    }, {
      b: {
        ba: 'BA'
      }
    }, {
      b: {
        bb: 'BB',
        bc: [ 1, 'bc' ],
        bd: {
          bdd: 'BDBD'
        }
      }
    }), {
      a: 'A',
      b: {
        ba: 'BA',
        bb: 'BB',
        bc: [ 1, 'bc' ],
        bd: {
          bdd: 'BDBD'
        }
      }
    });
  });

  it('Merged with identity on left', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.merge({}, obj), obj);
    }));
  });

  it('Merged with identity on right', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.merge(obj, {}), obj);
    }));
  });

  it('Merged with itself is itself', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.merge(obj, obj), obj);
    }));
  });

  it('Merge(a, Merge(b, c)) === Merge(Merge(a, b), c)', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), (a, b, c) => {
      const one = Merger.merge(a, Merger.merge(b, c));
      const other = Merger.merge(Merger.merge(a, b), c);
      assert.deepEqual(other, one);
    }));
  });

  it('Merge(a, b) contains all the keys of b', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), (a, b) => {
      const output = Merger.merge(a, b);
      const keys = Obj.keys(b);
      const oKeys = Obj.keys(output);
      return Arr.forall(keys, (k) => {
        return Arr.contains(oKeys, k);
      });
    }));
  });

  it('Deep-merged with identity on left', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.deepMerge({}, obj), obj);
    }));
  });

  it('Deep-merged with identity on right', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.deepMerge(obj, {}), obj);
    }));
  });

  it('Deep-merged with itself is itself', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), (obj) => {
      assert.deepEqual(Merger.deepMerge(obj, obj), obj);
    }));
  });

  it('Deep-merge(a, Deep-merge(b, c)) === Deep-merge(Deep-merge(a, b), c)', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), (a, b, c) => {
      const one = Merger.merge(a, Merger.merge(b, c));
      const other = Merger.merge(Merger.merge(a, b), c);
      assert.deepEqual(other, one);
    }));
  });

  it('Deep-merge(a, b) contains all the keys of b', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.json()), fc.dictionary(fc.asciiString(), fc.json()), (a, b) => {
      const output = Merger.deepMerge(a, b);
      const keys = Obj.keys(b);
      const oKeys = Obj.keys(output);
      return Arr.forall(keys, (k) => {
        return Arr.contains(oKeys, k);
      });
    }));
  });
});
