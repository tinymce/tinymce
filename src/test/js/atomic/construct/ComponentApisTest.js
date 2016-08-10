test(
  'ComponentApisTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.construct.ComponentApis',
    'ephox.alloy.test.TestStore',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Logger, RawAssertions, ComponentApis, TestStore, Arr, Obj, Fun, Struct) {
    var behaviour = Struct.immutable('name', 'apis');

    var checkErr = function (expectedPart, info, behaviours) {
      var continued = false;
      try {
        var combined = ComponentApis.combine(info, behaviours, [ 'extra-args' ]);
        continued = true;        
      } catch (err) {
        var errMessage = Arr.map(err, function (e) {
          return e.message !== undefined ? e.message : e;
        }).join('');
        // Not using message when coming from getOrDie
        console.log(errMessage);
        RawAssertions.assertEq(
          'Checking error of combined api. Expecting to contain("' + expectedPart + '")\nActual: ' + errMessage,
          true,
          errMessage.indexOf(expectedPart) > -1
        );
      }

      if (continued) assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
    };

    var store = TestStore();

    var check = function (expected, info, behaviours) {
      store.clear();
      var combined = ComponentApis.combine(info, behaviours, [ 'extra-args' ]);
      var apis = Obj.keys(combined).sort();
      Arr.each(apis, function (apiName) {
        combined[apiName]();
      });

      store.assertEq('Checking combined api', expected);
    };

    var ao = function (apiOrder) {
      return {
        apiOrder: Fun.constant(apiOrder)
      };
    };

    var handler = function (message) {
      return function () {
        store.adder(message)();
      };
    };

    Logger.sync(
      'Test with no apis',
      function () {
        check([ ], ao({}), [ ]);
      }
    );

    Logger.sync(
      'Test with 1 api from 1 behaviour',
      function () {
        check([
          'isAlpha.action'
        ], ao({}), [
          behaviour('alpha', {
            'isAlpha': handler('isAlpha.action')
          })
        ]);
      }
    );

    Logger.sync(
      'Test with 1 api with 2 behaviours and no order',
      function () {
        checkErr(
          'API ordering',
          ao({}), [
          behaviour('alpha.1', {
            'isAlpha': handler('isAlpha.1.action')
          }),
          behaviour('alpha.2', {
            'isAlpha': handler('isAlpha.2.action')
          })
        ]);
      }
    );

    Logger.sync(
      'Test with 1 api with 2 behaviours and an *incomplete* order',
      function () {
        checkErr(
          'entry for alpha.1',
          ao({
            'isAlpha': [ 'alpha.2' ]
          }), [
          behaviour('alpha.1', {
            'isAlpha': handler('isAlpha.1.action')
          }),
          behaviour('alpha.2', {
            'isAlpha': handler('isAlpha.2.action')
          })
        ]);
      }
    );

    Logger.sync(
      'Test with 1 api with 2 behaviours and an order',
      function () {
        check(
          [
            'isAlpha.2.action',
            'isAlpha.1.action'
          ],
          ao({
            'isAlpha': [ 'alpha.2', 'alpha.1' ]
          }), 
          [
            behaviour('alpha.1', {
              'isAlpha': handler('isAlpha.1.action')
            }),
            behaviour('alpha.2', {
              'isAlpha': handler('isAlpha.2.action')
            })
          ]
        );
      }
    );

    Logger.sync(
      'Complex Test with 2 apis and 3 behaviours and missing notmiddle order so *incomplete*',
      function () {
        checkErr(
          'API call (notmiddle)',
          ao({
            'all': [ 'b1', 'b3', 'b2' ],
            'middle': [ 'b2' ]
          }), 
          [
            behaviour('b1', {
              'all': handler('b1.all'),
              'notmiddle': handler('b1.notmiddle')
            }),
            behaviour('b2', {
              'all': handler('b2.all'),
              'middle': handler('b2.middle')              
            }),
            behaviour('b3', {
              'all': handler('b3.all'),
              'notmiddle': handler('b3.notmiddle')
            })
          ]
        );
      }
    );

    Logger.sync(
      'Complex Test with 2 apis and 3 behaviours and missing middle order but it only has one',
      function () {
        check(
          [
            'b1.all',
            'b3.all',
            'b2.all',

            'b2.middle',

            'b3.notmiddle',
            'b1.notmiddle'
          ],
          ao({
            'all': [ 'b1', 'b3', 'b2' ],
            'notmiddle': [ 'b3', 'b1' ]
          }), 
          [
            behaviour('b1', {
              'all': handler('b1.all'),
              'notmiddle': handler('b1.notmiddle')
            }),
            behaviour('b2', {
              'all': handler('b2.all'),
              'middle': handler('b2.middle')              
            }),
            behaviour('b3', {
              'all': handler('b3.all'),
              'notmiddle': handler('b3.notmiddle')
            })
          ]
        );
      }
    );

    Logger.sync(
      'Complex Test with 2 apis and 3 behaviours and correct order',
      function () {
        check(
          [
            'b1.all',
            'b3.all',
            'b2.all',

            'b2.middle',

            'b3.notmiddle',
            'b1.notmiddle'
          ],
          ao({
            'all': [ 'b1', 'b3', 'b2' ],
            'middle': [ 'b2' ],
            'notmiddle': [ 'b3', 'b1' ]
          }), 
          [
            behaviour('b1', {
              'all': handler('b1.all'),
              'notmiddle': handler('b1.notmiddle')
            }),
            behaviour('b2', {
              'all': handler('b2.all'),
              'middle': handler('b2.middle')              
            }),
            behaviour('b3', {
              'all': handler('b3.all'),
              'notmiddle': handler('b3.notmiddle')
            })
          ]
        );
      }
    );
  }
);