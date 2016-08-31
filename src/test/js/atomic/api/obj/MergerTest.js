test('Merger',

  [
    'ephox.katamari.api.Merger',
    'ephox.wrap.Jsc'
  ],

  function(Merger, Jsc) {

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

    Jsc.property('Deep-merged with identity on left', Jsc.dict(Jsc.json), function (obj) {
      return Jsc.eq(obj, Merger.deepMerge({}, obj));
    });

    Jsc.property('Deep-merged with identity on right', Jsc.dict(Jsc.json), function (obj) {
      return Jsc.eq(obj, Merger.deepMerge(obj, {}));
    });



  }
);