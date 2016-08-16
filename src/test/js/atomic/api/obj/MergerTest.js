test('Merger',

  [
    'ephox.katamari.api.Merger'
  ],

  function(Merger) {

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

  }
);