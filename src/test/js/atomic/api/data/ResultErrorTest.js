test(
  'Result.error tests',
 
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.wrap.Jsc'
  ],
 
  function (Fun, Result, Jsc) {
    var testSanity = function () {
      var s = Result.error('error');
      assert.eq(false, s.is('error'));
      assert.eq(false, s.isValue());
      assert.eq(true, s.isError());
      assert.eq(6, s.getOr(6));
      assert.eq(6, s.getOrThunk(function () { return 6; }));
      assert.throws(function () {
        s.getOrDie();
      });
      assert.eq(6, s.or(Result.value(6)).getOrDie());
      assert.throws(function () {
        s.orThunk(function () {
          return Result.error('Should not get here.');
        }).getOrDie();
      });

      assert.eq('error!', s.fold(function (e) {
        return e + '!';
      }, function (v) {
        return v + 6;
      }));

      assert.throws(function () {
        s.map(function (v) {
          return v * 2;
        }).getOrDie();
      });

      assert.throws(function () {
        s.bind(function (v) {
          return Result.value('test' + v);
        }).getOrDie();
      });

      assert.eq(false, s.exists(Fun.always));
      assert.eq(true, s.forall(Fun.never));
      
      assert.eq(true, Result.error(4).toOption().isNone());
    };

    var arbResultError = Jsc.string.smap(function (e) {
      return Result.error(e);
    }, function (res) {
      return res.fold(Fun.identity, Fun.die('This should not happen'));
    }, function (res) {
      return res.fold(function (e) {
        return 'Result.error(' + e + ')';
      }, function (v) {
        return 'Result.value(' + v + ')';
      });
    });

    var testSpecs = function () {
      Jsc.property('Checking error:is is always false', arbResultError, function (res) {
        var v = res.fold(Fun.identity, Fun.die('should be result.error'));
        return Jsc.eq(false, res.is(v));
      });

      Jsc.property('Checking error:isValue is always false', arbResultError, function (res) {
        return Jsc.eq(false, res.isValue());
      });      

      Jsc.property('Checking error:isError is always true', arbResultError, function (res) {
        return Jsc.eq(true, res.isError());
      });      

      Jsc.property('Checking error.getOr(v) = v', arbResultError, 'json', function (res, json) {
        return Jsc.eq(json, res.getOr(json));
      });


      Jsc.property('Checking error:forall is always true', arbResultError, 'string -> bool', function (res, f) {
        return Jsc.eq(true, res.forall(f));
      });

      Jsc.property('Checking error:exists is always false', arbResultError, 'string -> bool', function (res, f) {
        return Jsc.eq(false, res.exists(f));
      });
    };
     

    testSanity();
    testSpecs();
    
  }
);