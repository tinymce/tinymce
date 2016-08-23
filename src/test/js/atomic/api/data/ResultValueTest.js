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

      // Jsc.property('Checking value.isValue is always false', arbResultError, function (res) {
      //   return Jsc.eq(false, res.isValue());
      // });      

      // Jsc.property('Checking value.isError is always true', arbResultError, function (res) {
      //   return Jsc.eq(true, res.isError());
      // });      

      // Jsc.property('Checking value.getOr(v) = v', arbResultError, 'json', function (res, json) {
      //   return Jsc.eq(json, res.getOr(json));
      // });

      // Jsc.property('Checking value.getOrDie() always throws', arbResultError, function (res) {
      //   try {
      //     res.getOrDie();
      //     return false;
      //   } catch (err) {
      //     return true;
      //   }
      // });

      // Jsc.property('Checking value.or(value) = value', arbResultError, 'json', function (res, json) {
      //   var output = res.or(Result.value(json));
      //   return Jsc.eq(true, output.is(json));
      // });

      // Jsc.property('Checking value.orThunk(function () { return value; }) = value', arbResultError, 'json', function (res, json) {
      //   var output = res.orThunk(function () {
      //     return Result.value(json);
      //   });
      //   return Jsc.eq(true, output.is(json));
      // });

      // Jsc.property('Checking value.fold(_ -> x, die) = x', arbResultError, 'json', function (res, json) {
      //   var actual = res.fold(Fun.constant(json), Fun.die('Should not die'));
      //   return Jsc.eq(json, actual);
      // });

      // Jsc.property('Checking value.map(f) = error', arbResultError, 'string -> json', function (res, f) {
      //   var actual = res.map(f);
      //   return Jsc.eq(true, actual.fold(function (e) {
      //     return e == res.fold(Fun.identity, Fun.die('should not get here!'));
      //   }), Fun.constant(false));
      // });

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