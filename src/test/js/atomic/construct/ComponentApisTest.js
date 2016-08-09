test(
  'ComponentApisTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.construct.ComponentApis',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Logger, RawAssertions, ComponentApis, Fun, Struct) {
    var behaviour = Struct.immutable('name', 'apis');

    var checkErr = function (expected, info, behaviours) {
      var continued = false;
      try {
        var combined = ComponentApis.combine(info, behaviours, [ 'extra-args' ]);
        continued = true;        
      } catch (err) {
        RawAssertions.assertEq('Checking error of combined api', expected, err.message);
      }

      if (continued) assert.fail('Expected error: ' + expected + ' was not thrown');
    };

    var check = function (expected, info, behaviours) {
      var combined = ComponentApis.combine(info, behaviours, [ 'extra-args' ]);
      RawAssertions.assertEq('Checking combined api', expected, combined);
    };

    var ao = function (apiOrder) {
      return {
        apiOrder: Fun.constant(apiOrder)
      };
    };

    Logger.sync(
      'Test with no apis',
      function () {
        check({ }, ao({}), [ ]);
      }
    );

    Logger.sync(
      'Test with 1 api from 1 behaviour',
      function () {
        check({ 
          isAlpha: 'isAlpha.action'
        }, ao({}), [
          behaviour('alpha', {
            'isAlpha': 'isAlpha.action'
          })
        ]);
      }
    );
  }
);