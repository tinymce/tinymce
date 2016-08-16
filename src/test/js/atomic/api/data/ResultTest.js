test(
  'ValueTest',

  [
    'ephox.katamari.api.Result'
  ],

  function (Result) {

    var s = Result.value(5);
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

    assert.eq(true, Result.value(5).toOption().isSome());
  }
);

test(
  'ErrorTest',

  [
    'ephox.katamari.api.Result'
  ],

  function (Result) {

    var s = Result.error('error');
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

    assert.eq('error', s.fold(function (e) {
      return e;
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

    assert.eq(true, Result.error(4).toOption().isNone());
  }
);
