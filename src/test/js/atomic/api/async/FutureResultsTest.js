asynctest(
  'FutureResultsTest',
 
  [
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.FutureResults',
    'ephox.katamari.api.Result',
    'ephox.katamari.test.AsyncProps',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc',
    'global!Promise'
  ],
 
  function (FutureResult, FutureResults, Result, AsyncProps, ArbDataTypes, Jsc, Promise) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var testBindFuture = function () {
      return new Promise(function (resolve, reject) {
        var fut = FutureResult.pure('10');

        var f = function (x) {
          return FutureResult.pure(x + '.bind');
        };

        FutureResults.bindFuture(fut, f).get(function (output) {
          var value = output.getOrDie();
          assert.eq('10.bind', value);
          resolve(true);
        });
      });
    };

 
    var testSpecs = function () {
      return AsyncProps.checkProps([
        {
          label: 'FutureResults.bindFuture resolves with data',
          arbs: [ ArbDataTypes.futureResult, Jsc.fun(ArbDataTypes.futureResult) ],
          f: function (futureResult, g) {
            var bound = FutureResults.bindFuture(futureResult, g);
            return AsyncProps.checkFuture(bound, function (data) {
              return data.fold(function (err) {
                return Result.error('Unexpected error in test: ' + err);
              }, function (value) {
                // return Jsc.eq(json, value) ? Result.value(true) : Result.error('Payload is not the same');  
                return Result.value(true);
              });              
            });
          }       
        }
      ]);
    };

    testBindFuture().then(testSpecs).then(function () {
      success();
    }, failure);

  }
);