import Adt from 'ephox/katamari/api/Adt';
import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Obj from 'ephox/katamari/api/Obj';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ADT Test', function() {
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

  var allKeys = [ 'nothing', 'unknown', 'exact' ];
  var arbKeys = Jsc.elements(allKeys);

  Jsc.property('Error is thrown if not all arguments are supplied', arbAdt, Jsc.nearray(arbKeys), function (subject, exclusions) {
    var original = Arr.filter(allKeys, function (k) {
      return !Arr.contains(exclusions, k);
    });

    try {
      var branches = Obj.tupleMap(original, function (k, i) {
        return { k: k, v: Fun.identity };
      });
      subject.match(branches);
      return false;
    } catch (err) {
      return err.message.indexOf('nothing') > -1;
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

  Jsc.property('adt.nothing.match should be same as fold', arbNothing, function (subject) {
    var matched = subject.match({
      nothing: record,
      unknown: Fun.die('should not be unknown'),
      exact: Fun.die('should not be exact')
    });

    var folded = subject.fold(record, Fun.die('should not be unknown'), Fun.die('should not be exact'));
    return Jsc.eq(matched, folded);
  });

  Jsc.property('adt.unknown.match should pass 1 parameter: [ guesses ]', arbUnknown, function (subject) {
    var contents = subject.match({
      nothing: Fun.die('should not be nothing'),
      unknown: record,
      exact: Fun.die('should not be exact')
    });
    return Jsc.eq(1, contents.length);
  });

  Jsc.property('adt.unknown.match should be same as fold', arbUnknown, function (subject) {
    var matched = subject.match({
      nothing: Fun.die('should not be nothing'),
      unknown: record,
      exact: Fun.die('should not be exact')
    });

    var folded = subject.fold(Fun.die('should not be nothing'), record, Fun.die('should not be exact'));
    return Jsc.eq(matched, folded);
  });

  Jsc.property('adt.exact.match should pass 2 parameters [ value, precision ]', arbExact, function (subject) {
    var contents = subject.match({
      nothing: Fun.die('should not be nothing'),
      unknown: Fun.die('should not be unknown'),
      exact: record
    });
    return Jsc.eq(2, contents.length);
  });

  Jsc.property('adt.exact.match should be same as fold', arbExact, function (subject) {
    var matched = subject.match({
      nothing: Fun.die('should not be nothing'),
      unknown: Fun.die('should not be unknown'),
      exact: record
    });

    var folded = subject.fold(Fun.die('should not be nothing'), Fun.die('should not be unknown'), record);
    return Jsc.eq(matched, folded);
  });

  Jsc.property('adt.match must have the right arguments, not just the right number', arbAdt, function (subject) {
    try {
      subject.match({
        not: Fun.identity,
        the: Fun.identity,
        right: Fun.identity
      });
      return false;
    } catch (err) {
      return err.message.indexOf('nothing') > -1;
    }
  });
});

