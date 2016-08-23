test(
  'ADT Test',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.wrap.Jsc',
    'global!Array'
  ],

  function (Adt, Arr, Fun, Obj, Jsc, Array) {

    var checkInvalid = function (message, f) {
      var error = false;
      try {
        f();
      } catch (e) {
        if (e === 'ADTWHOOPS') {
          console.log('die function incorrectly called');
        } else {
          error = true;
        }
      }

      if (!error) {
        throw 'Unexpected pass: ' + message;
      }
    };

    var checkInvalidGenerate = function (cases, message) {
      checkInvalid('generate() did not throw an error. Input: "' + message + "'", function () {
        Adt.generate(cases);
      });
    };

    checkInvalidGenerate({}, 'object instead of array');
    checkInvalidGenerate([], 'empty cases array');
    checkInvalidGenerate(['f'], 'array contains strings');
    checkInvalidGenerate([{}], 'empty case');
    checkInvalidGenerate([{'t': {}}], 'object case arguments');
    checkInvalidGenerate([{'cata': []}], 'case named cata');
    checkInvalidGenerate([{'a': []},{'a': []}], 'duplicate names');
    checkInvalidGenerate([
       {
        'one': [],
        'two': []
       }
      ], 'two cases in one');

    // A real Adt from the soldier project
    var soldierBlock = Adt.generate([
      { 'none':     [] },
      { 'root':     ['target', 'block'] },
      { 'created':  ['target', 'block'] },
      { 'actual':   ['target', 'block'] }
    ]);

    var none = function () {
      assert.eq(0, arguments.length);
    };

    var targetStr = 'target';
    var blockStr = 'block';

    var tag = function (target, block) {
      assert.eq(2, arguments.length);
      assert.eq(targetStr, target);
      assert.eq(blockStr, block);
    };

    var die = function () {
      // this is used when an error is expected, so we need to use fancy tricks
      // to actually fail
      throw 'ADTWHOOPS';
    };

    // double functions because that makes actual use better
    var adtNone = soldierBlock.none();
    var adtRoot = soldierBlock.root(targetStr, blockStr);
    var adtCreated = soldierBlock.created(targetStr, blockStr);
    var adtActual = soldierBlock.actual(targetStr, blockStr);

    checkInvalid('tag passed to none', function () {
      adtNone.fold(tag, die, die, die);
    });

    checkInvalid('none passed to root', function () {
      adtRoot.fold(die, none, die, die);
    });

    checkInvalid('none passed to created', function () {
      adtCreated.fold(die, die, none, die);
    });

    checkInvalid('none passed to actual', function () {
      adtActual.fold(die, die, die, none);
    });

    // valid checks, so we can redefine die to be sensible now
    die = Fun.die('Well that was unexpected');

    adtNone.fold(   none, die, die, die);
    adtRoot.fold(    die, tag, die, die);
    adtCreated.fold( die, die, tag, die);
    adtActual.fold(  die, die, die, tag);

    var cheese = Fun.constant('cheese');

    assert.eq('cheese', adtNone.fold(   cheese,    die,    die,    die));
    assert.eq('cheese', adtRoot.fold(      die, cheese,    die,    die));
    assert.eq('cheese', adtCreated.fold(   die,    die, cheese,    die));
    assert.eq('cheese', adtActual.fold(    die,    die,    die, cheese));

    var newAdt = Adt.generate([
      { nothing: [ ] },
      { unknown: [ 'guesses' ] },
      { exact: [ 'value', 'precision' ] }
    ]);

    var arbNothing = Jsc.constant(newAdt.nothing());

    var arbUnknown = Jsc.array(Jsc.string).smap(function (guesses) {
      return newAdt.unknown(guesses);
    }, function (r) {
      return r.match({
        nothing: Fun.die('not a nothing'),
        unknown: Fun.identity,
        exact: Fun.die('not an exact')
      });
    });

    var arbExact = Jsc.tuple([Jsc.number, Jsc.number]).smap(function (arr) {
      return newAdt.exact(arr[0], arr[1]);
    }, function (r) {
      return r.match({
        nothing: Fun.die('not a nothing'),
        unknown: Fun.die('not an unknown'),
        exact: function (value, precision) { return [ value, precision ]; }
      });
    });

    var arbAdt = Jsc.oneof([
      arbNothing,
      arbUnknown,
      arbExact
    ]);

    // Fix with property-based testing
    var allKeys = [ 'nothing', 'unknown', 'exact' ];
    var arbKeys = Jsc.elements(allKeys);

    Jsc.property('Error is thrown if not all arguments are supplied', arbAdt, Jsc.nearray(arbKeys), function (subject, exclusions) {
      var original = Arr.filter(allKeys, function (k) {
        return !Arr.contains(exclusions, k);
      });

      try {
        var branches = Obj.tupleMap(original, function (k, i) {
          return { k: k, v: function () { } };
        });
        subject.match(branches);
        return false;
      } catch (err) {
        return true;
      }
    });

    var record = function () {
      return Array.prototype.slice.call(arguments, 0);
    };

    Jsc.property('adt.nothing.match should pass [ ]', arbNothing, function (subject) {
      var contents = subject.match({
        nothing: record,
        unknown: Fun.die('should not be unknown'),
        exact: Fun.die('should not be exact')
      });
      return Jsc.eq([ ], contents);
    });

    Jsc.property('adt.unknown.match should pass 1 parameter: [ guesses ]', arbUnknown, function (subject) {
      var contents = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: record,
        exact: Fun.die('should not be exact')
      });
      return Jsc.eq(1, contents.length);
    });

    Jsc.property('adt.unknown.match should pass 2 parameters [ value, precision ]', arbExact, function (subject) {
      var contents = subject.match({
        nothing: Fun.die('should not be nothing'),
        unknown: Fun.die('should not be unknown'),
        exact: record
      });
      return Jsc.eq(2, contents.length);
    });
  }
);