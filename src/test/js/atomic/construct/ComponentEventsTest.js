test(
  'ComponentEventsTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.test.TestStore',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Logger, RawAssertions, ComponentEvents, TestStore, Arr, Obj, Fun, Struct) {
    var behaviour = Struct.immutable('name', 'handlers');

    var store = TestStore();

    var base = {
      'base.behaviour': {
        'test': ComponentEvents.handler({
          run: function () {
            store.adder('test.base.run')();
          }
        })
      }
    };

    var checkErr = function (expectedPart, info, behaviours) {
      var continued = false;
      try {
        ComponentEvents.combine(info, behaviours, base);
        continued = true;        
      } catch (err) {
        RawAssertions.assertEq(
          'Checking error of combined events. Expecting to contain("' + expectedPart + '")\nActual: ' + err.message,
          true,
          err.message.indexOf(expectedPart) > -1
        );
      }

      if (continued) assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
    };

    var check = function (expected, info, behaviours) {
      store.clear();
      var combined = ComponentEvents.combine(info, behaviours, base);
      console.log('check.combined', combined);;
      var events = Obj.keys(combined).sort();
      Arr.each(events, function (eventName) {
        console.log('eventname', eventName, combined[eventName]);
        combined[eventName]();
      });

      store.assertEq('Checking combined api', expected);
    };

    var eo = function (eventOrder) {
      return {
        eventOrder: Fun.constant(eventOrder)
      };
    };

    // Logger.sync(
    //   'Testing no behaviours',
    //   function () {
    //     check([ ], eo([ ]), [ ]);
    //   }
    // );

    Logger.sync(
      'Testing 1 behaviour with 1 event',
      function () {
        check([ ], eo([ ]), [
          behaviour('a.behaviour', {
            'event.one': ComponentEvents.handler({
              run: function () {
                console.log('hi');
              }
            })
          })
        ]);
      }
    );
  }
);