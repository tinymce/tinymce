test(
  'ADT Test',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Adt'
  ],

  function (Fun, Adt) {

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
  }
);