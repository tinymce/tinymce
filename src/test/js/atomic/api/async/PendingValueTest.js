asynctest(
  'PendingValueTest',

  [
    'ephox.katamari.api.PendingValue',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],

  function (PendingValue, Jsc, Promise, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var called = 0;

    var getCheck = function (expected) {
      return function (actual) {
        called++;
        assert.eq(expected, actual);
      };
    };

    var data = 'the data';
/*
    var pval = PendingValue();
    assert.eq(false, pval.isAvailable());
    pval.onReady(getCheck(data));
    pval.onReady(getCheck(data));
    pval.set(data);
    assert.eq(true, pval.isAvailable());
    pval.onReady(getCheck(data));

    assert.eq(0, called);
    */

    var checkProp = function (label, arbitraries, f) {
      return Jsc.check(
        Jsc.forall.apply(Jsc, arbitraries.concat([ f ])),
        {

        }
      ).then(function (result) {
        if (result === true) { return Promise.resolve(result); }
        else return Promise.reject(result);
      });
    };

    checkProp(
      'onReady calls with the right data',
      [ Jsc.json ],
      function (json) {
        var pv = PendingValue();
        return new Promise(function (resolve, reject) {
          pv.set(json);
          pv.onReady(function (data) {
            resolve(Jsc.eq(json, data));
          });
        });
      }
    ).then(function () {
      return checkProp(
        'onReady calls with the right data',
        [ Jsc.json, Jsc.json ],
        function (json1, json2) {
          var pv = PendingValue();
          return new Promise(function (resolve, reject) {
            pv.set(json1);
            pv.set(json2);
            pv.onReady(function (data) {
              resolve(Jsc.eq(json2, data));
            });
          });
        }
      );
    }).then(function () {
      success();
    }, function (err) {
      failure(err);
    });    
  }
);