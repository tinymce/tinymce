test(
  'ObjectsTest',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.wrap.Jsc'
  ],

  function (Objects, Arr, Obj, Jsc) {
    // TODO: Add more tests.
    // Jsc.check(
    //       Jsc.forall.apply(Jsc, args),
    //       options
    //     ).then(function (result) {
    //       return result !== true ? die(formatErr(name, result)) : next();
    //     }, function (err) {
    //       die(err);
    //     });


    // var narrowGen = Jsc.tuple(].generator.flatMap(function ()))

    var smallSet = Jsc.nestring;

    var check = function (arb, checker) {
      Jsc.check(
        Jsc.forall(arb, function (input) {
          checker(input);
          return true;
        })
      );
    };

    // Objects.narrow
    (function () {
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

      (function () {
        var actual = Objects.narrow({ a: 'a', b: 'b', c: 'c' }, [ 'a', 'c', 'e' ]);
        assert.eq({ a: 'a', c: 'c' }, actual);
      })();
    })();
    
    (function () {
      var subject = { alpha: 'Alpha' };

      assert.eq('Alpha', Objects.readOpt('alpha')(subject).getOrDie('readOpt(alpha) => some(Alpha)'), 'readOpt(alpha) => some(Alpha)');
      assert.eq(true, Objects.readOpt('beta')(subject).isNone(), 'readOpt(beta) => none');

      assert.eq('Alpha', Objects.readOr('alpha', 'fallback')(subject), 'readOr(alpha) => Alpha');
      assert.eq('fallback', Objects.readOr('beta', 'fallback')(subject), 'readOr(beta) => fallback');
    //   var readOpt = function (key) {
    //   return ObjReader.readOpt(key);
    // };

    // var readOrErr = function (key) {
    //   return ObjReader.readOrErr(key);
    // };

    // var readOr = function (key, fallback) {
    //   return ObjReader.readOr(key, fallback);
    // };

    // var readOptFrom = function (obj, key) {
    //   return ObjReader.readOptFrom(obj, key);
    // };
    })();


  }
);