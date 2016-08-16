test('Zipper', 

  [
    'ephox.katamari.api.Zipper'
  ],

  function(Zipper) {    
    var check1 = function(expectedZipToObject, expectedZipToTuples, keys, values) {
      var sort = function(a, ord) {
        var c = a.slice();
        c.sort(ord);
        return c;
      };

      var eq = 0;
      var lt = -1;
      var gt = 1;

      var sortTuples = function(a) {
      return a;     
        return  sort(a, function(a, b) {
          return (
            a.k === b.k ? a.v === b.v ? eq
                                      : a.v > b.v ? gt
                                                  : lt
                        : a.k > b.k ? gt
                                    : lt
          );
        });
      };

      assert.eq(expectedZipToObject, Zipper.zipToObject(keys, values));
      assert.eq(sortTuples(expectedZipToTuples), sortTuples(Zipper.zipToTuples(keys, values)));
    };

    check1(
      {q: 'a', r: 'x'},
      [{k: 'q', v: 'a'}, {k: 'r', v: 'x'}],
      ['q', 'r'], 
      ['a', 'x']
    );

    check1(
      {},
      [],
      [], 
      []
    );
    check1(
      {},
      [], 
      [],
      ['x']
    );
    check1(
      {},
      [],
      [], 
      ['x', 'y']
    );
    check1(
      {q: undefined},
      [{k: 'q', v: undefined}],
      ['q'], 
      []
    );
    check1(
      {q: undefined, r: undefined},
      [{k: 'q', v: undefined}, {k: 'r', v: undefined}],
      ['q', 'r'], 
      []
    );
    check1(
      {q: 'a', r: undefined},
      [{k: 'q', v: 'a'}, {k: 'r', v: undefined}],
      ['q', 'r'], 
      ['a']
    );
  }
);