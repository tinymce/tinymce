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
        'event.0': ComponentEvents.handler({
          run: store.adder('base.0')
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
          'Checking error of combined events. Expecting to contain("' + expectedPart + '")\nActual: ' + err,
          true,
          // Not using message because coming from getOrDie
          err.indexOf(expectedPart) > -1
        );
      }

      if (continued) assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
    };

    var check = function (expected, info, behaviours) {
      store.clear();
      var combined = ComponentEvents.combine(info, behaviours, base);
      console.log('check.combined', combined);
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

    Logger.sync(
      'Testing no behaviours',
      function () {
        check([
          'base.0'
        ], eo([ ]), [ ]);
      }
    );

    Logger.sync(
      'Testing 1 behaviour with 1 event',
      function () {
        check([
          'base.0',
          'a.one'
        ], eo([ ]), [
          behaviour('a.behaviour', {
            'event.1': ComponentEvents.handler({
              run: store.adder('a.one')
            })
          })
        ]);
      }
    );

    Logger.sync(
      'Testing 1 behaviour with 2 events',
      function () {
        check([
          'base.0',
          'a.one',
          'a.two'
        ], eo([ ]), [
          behaviour('a.behaviour', {
            'event.1': ComponentEvents.handler({
              run: store.adder('a.one')
            }),
            'event.2': ComponentEvents.handler({
              run: store.adder('a.two')
            })
          })
        ]);
      }
    );

    Logger.sync(
      'Testing complex behaviour with many events and incomplete ordering',
      function () {
        checkErr(
          'event ordering',
          eo([ ]), [
            behaviour('a.behaviour', {
              'event.1': ComponentEvents.handler({
                run: store.adder('a.one')
              }),
              'event.2': ComponentEvents.handler({
                run: store.adder('a.two')
              }),
              'event.3': ComponentEvents.handler({
                can: function () {
                  store.adder('a.three.cannot')();
                  return false;
                },
                run: store.adder('a.three')
              })
            }),
            behaviour('b.behaviour', {
              'event.3': ComponentEvents.handler({
                run: store.adder('b.three')
              })
            })
          ]
        );
      }
    );
  }
);