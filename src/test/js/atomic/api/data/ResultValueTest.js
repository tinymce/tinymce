test(
  'ResultValueTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc'
  ],

  function (Fun, Result, ArbDataTypes, Jsc) {
    var testSanity = function () {
      var s = Result.value(5);
      assert.eq(true, s.is(5));
      assert.eq(true, s.isValue());
      assert.eq(false, s.isError());
      assert.eq(5, s.getOr(6));
      assert.eq(5, s.getOrThunk(function () { return 6; }));
      assert.eq(5, s.getOrDie());
      assert.eq(5, s.or(Result.value(6)).getOrDie());
      assert.eq(5, s.orThunk(function () {
        return Result.error('Should not get here.');
      }).getOrDie());

      assert.eq(11, s.fold(function (e) {
        throw 'Should not get here!';
      }, function (v) {
        return v + 6;
      }));

      assert.eq(10, s.map(function (v) {
        return v * 2;
      }).getOrDie());

      assert.eq('test5', s.bind(function (v) {
        return Result.value('test' + v);
      }).getOrDie());

      assert.eq(true, s.exists(Fun.always));
      assert.eq(false, s.forall(Fun.never));

      assert.eq(true, Result.value(5).toOption().isSome());      
    };

    var arbResultError = ArbDataTypes.resultError;
    var arbResultValue = ArbDataTypes.resultValue;

    var testSpecs = function () {
      Jsc.property('Checking value.is(value.getOrDie()) is always true', arbResultValue, function (res) {
        return Jsc.eq(true, res.is(res.getOrDie()));
      });

      Jsc.property('Checking value.isValue is always true', arbResultValue, function (res) {
        return Jsc.eq(true, res.isValue());
      });      

      Jsc.property('Checking value.isError is always false', arbResultValue, function (res) {
        return Jsc.eq(false, res.isError());
      });      

      Jsc.property('Checking value.getOr(v) === value.value ', arbResultValue, 'json', function (res, json) {
        var inside = res.fold(Fun.die('no'), Fun.identity);
        return Jsc.eq(inside, json) ? true : Jsc.eq(inside, res.getOr(json)) === true;
      });

      Jsc.property('Checking value.getOrDie() does not throw', arbResultValue, function (res) {
        try {
          res.getOrDie();
          return true;
        } catch (err) {
          return false;
        }
      });

      Jsc.property('Checking value.or(oValue) = value', arbResultValue, 'json', function (res, json) {
        var inside = res.fold(Fun.die('no'), Fun.identity);
        return Jsc.eq(inside, json) ? true : Jsc.eq(inside, res.or(Result.value(json)).getOr(json)) === true;
      });

      Jsc.property('Checking value.orThunk(die) does not throw', arbResultValue, function (res) {
        try {
          res.orThunk(Fun.die('dies'));
          return true;
        } catch (err) {
          return false;
        }
      });

      Jsc.property('Checking value.fold(die, id) = value.getOrDie()', arbResultValue, 'json', function (res, json) {
        var actual = res.getOrDie();
        return Jsc.eq(actual, res.fold(Fun.die('should not get here'), Fun.identity));
      });

      Jsc.property('Checking value.map(f) = f(value.getOrDie())', arbResultValue, 'json -> json', function (res, f) {
        return Jsc.eq(res.map(f).getOrDie('not a value'), f(res.getOrDie()));
      });

      // Jsc.property('Checking value.map(f) = error', arbResultError, 'string -> json', function (res, f) {
      //   var actual = res.map(f);
      //   return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
      // });

      // Jsc.property('Checking value.each(f) = undefined', arbResultError, 'string -> json', function (res, f) {
      //   var actual = res.each(f);
      //   return Jsc.eq(undefined, actual);
      // });

      // Jsc.property('Checking value.bind(f -> RV) = error', arbResultError, Jsc.fn(arbResultValue), function (res, f) {
      //   var actual = res.bind(f);
      //   return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
      // });

      // Jsc.property('Checking value.bind(f -> RE) = error', arbResultError, Jsc.fn(arbResultError), function (res, f) {
      //   var actual = res.bind(f);
      //   return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
      // });

      // Jsc.property('Checking value.forall is always true', arbResultError, 'string -> bool', function (res, f) {
      //   return Jsc.eq(true, res.forall(f));
      // });

      // Jsc.property('Checking value.exists is always false', arbResultError, 'string -> bool', function (res, f) {
      //   return Jsc.eq(false, res.exists(f));
      // });

      // Jsc.property('Checking value.toOption is always none', arbResultError, function (res) {
      //   return Jsc.eq(true, res.toOption().isNone());
      // });
    };
     

    testSanity();
    testSpecs();
    
  }
);