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

    var pval = PendingValue();
    assert.eq(false, pval.isAvailable());
    pval.onReady(getCheck(data));
    pval.onReady(getCheck(data));
    pval.set(data);
    assert.eq(true, pval.isAvailable());
    pval.onReady(getCheck(data));

    assert.eq(0, called);

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
          pv.onReady(function (data) {
            resolve(Jsc.eq(json, data));
          });
          pv.set(json);          
        });
      }
    ).then(function () {
      return checkProp(
        'onReady calls with the second data',
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
      return checkProp(
        'isAvailable is false before being set and true afterwards',
        [ Jsc.json, Jsc.json ],
        function (json1, json2) {
          var pv = PendingValue();
          return new Promise(function (resolve, reject) {
            if (pv.isAvailable()) return false;
            pv.set(json1);
            pv.set(json2);
            pv.onReady(function (data) {
              resolve(Jsc.eq(json2, data) && Jsc.eq(true, pv.isAvailable()));
            });
          });
        }
      );
    }).then(function () {
      return checkProp(
        'onReady fires for all listeners',
        [ Jsc.json ],
        function (json) {
          var pv = PendingValue();
          var cache = [ ];
          return new Promise(function (resolve, reject) {
            if (pv.isAvailable()) return false;
            pv.onReady(function (data) {
              cache.push(data);
            });
            pv.onReady(function (data) {
              cache.push(data);
            });
            pv.set(json);
            setTimeout(function () {
              resolve(Jsc.eq(2, cache.length));
            }, 10);
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