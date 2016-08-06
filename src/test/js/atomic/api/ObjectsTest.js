test(
  'ObjectsTest',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.wrap.Jsc'
  ],

  function (Objects, Arr, Obj, Jsc) {
    var smallSet = Jsc.nestring;

    var check = function (arb, checker) {
      Jsc.check(
        Jsc.forall(arb, function (input) {
          checker(input);
          return true;
        })
      );
    };

    var testNarrow = function () {
      var narrowGen = Jsc.bless({
        generator: Jsc.dict(smallSet).generator.flatMap(function (obj) {
          var keys = Obj.keys(obj);
          return keys.length === 0 ? Jsc.constant( { obj: obj, fields: [ ] }).generator : Jsc.array(Jsc.elements(keys)).generator.map(function (fields) {
            return {
              obj: obj,
              fields: fields
            };
          });
        })
      });

      check(narrowGen, function (input) {
        var narrowed = Objects.narrow(input.obj, input.fields);
        Obj.each(narrowed, function (_, k) {        
          if (!Arr.contains(input.fields, k)) throw 'Narrowed object contained property: ' + k + ' which was not in fields: [' + input.fields.join(', ') + ']';
        });
        return true;
      });

      // Sanity test.
      var actual = Objects.narrow({ a: 'a', b: 'b', c: 'c' }, [ 'a', 'c', 'e' ]);
      assert.eq({ a: 'a', c: 'c' }, actual);
    };

    var testReaders = function () {
      // TODO: Think of a good way to property test.
      var subject = { alpha: 'Alpha' };

      assert.eq('Alpha', Objects.readOpt('alpha')(subject).getOrDie('readOpt(alpha) => some(Alpha)'), 'readOpt(alpha) => some(Alpha)');
      assert.eq(true, Objects.readOpt('beta')(subject).isNone(), 'readOpt(beta) => none');

      assert.eq('Alpha', Objects.readOr('alpha', 'fallback')(subject), 'readOr(alpha) => Alpha');
      assert.eq('fallback', Objects.readOr('beta', 'fallback')(subject), 'readOr(beta) => fallback');

      assert.eq('Alpha', Objects.readOptFrom(subject, 'alpha').getOrDie('readOptFrom(alpha) => some(Alpha)'), 'readOptFrom(alpha) => some(Alpha)');
      assert.eq(true, Objects.readOptFrom(subject, 'beta').isNone(), 'readOptFrom(beta) => none');
    };
    
    testNarrow();
    testReaders();
  }
);