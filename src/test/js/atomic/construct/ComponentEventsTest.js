test(
  'ComponentEventsTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.TestStore',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct'
  ],

  function (Logger, RawAssertions, ComponentEvents, EventHandler, TestStore, Arr, Obj, Fun, Struct) {
    var behaviour = Struct.immutable('name', 'handlers');

    var store = TestStore();

    var base = {
      'base.behaviour': {
        'event.0': EventHandler.nu({
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
        // Not using message when coming from getOrDie
        var errMessage = err.message !== undefined ? err.message : err;
        RawAssertions.assertEq(
          'Checking error of combined events. Expecting to contain("' + expectedPart + '")\nActual: ' + errMessage,
          true,
          
          errMessage.indexOf(expectedPart) > -1
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
        combined[eventName]('component', {
          stop: store.adder(eventName + '.stop')
        });
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
        ], eo({}), [ ]);
      }
    );

    Logger.sync(
      'Testing 1 behaviour with 1 event',
      function () {
        check([
          'base.0',
          'a.one'
        ], eo({}), [
          behaviour('a.behaviour', {
            'event.1': EventHandler.nu({
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
        ], eo({}), [
          behaviour('a.behaviour', {
            'event.1': EventHandler.nu({
              run: store.adder('a.one')
            }),
            'event.2': EventHandler.nu({
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
          eo({}), [
            behaviour('a.behaviour', {
              'event.1': EventHandler.nu({
                run: store.adder('a.one')
              }),
              'event.2': EventHandler.nu({
                run: store.adder('a.two')
              }),
              'event.3': EventHandler.nu({
                can: function () {
                  store.adder('a.three.cannot')();
                  return false;
                },
                run: store.adder('a.three')
              })
            }),
            behaviour('b.behaviour', {
              'event.3': EventHandler.nu({
                run: store.adder('b.three'),
                abort: function () {
                  store.adder('b.three.abort')();
                  return true;
                }
              })
            })
          ]
        );
      }
    );

    Logger.sync(
      'Testing complex behaviour with many events and not quite complete ordering',
      function () {
        checkErr(
          'entry for b.behaviour',
          eo({
            'event.3': [ 'a.behaviour' ]
          }), [
            behaviour('a.behaviour', {
              'event.1': EventHandler.nu({
                run: store.adder('a.one')
              }),
              'event.2': EventHandler.nu({
                run: store.adder('a.two')
              }),
              'event.3': EventHandler.nu({
                can: function () {
                  store.adder('a.three.cannot')();
                  return false;
                },
                run: store.adder('a.three')
              })
            }),
            behaviour('b.behaviour', {
              'event.3': EventHandler.nu({
                run: store.adder('b.three'),
                abort: function () {
                  store.adder('b.three.abort')();
                  return true;
                }
              })
            })
          ]
        );
      }
    );

    Logger.sync(
      'Testing complex behaviour with many events and *complete* ordering',
      function () {
        check(
          [ ],
          eo({
            'event.3': [ 'a.behaviour', 'b.behaviour' ]
          }), [
            behaviour('a.behaviour', {
              'event.1': EventHandler.nu({
                run: store.adder('a.one')
              }),
              'event.2': EventHandler.nu({
                run: store.adder('a.two')
              }),
              'event.3': EventHandler.nu({
                can: function () {
                  store.adder('a.three.cannot')();
                  return false;
                },
                run: store.adder('a.three')
              })
            }),
            behaviour('b.behaviour', {
              'event.3': EventHandler.nu({
                run: store.adder('b.three'),
                abort: function () {
                  store.adder('b.three.abort')();
                  return true;
                }
              })
            })
          ]
        );
      }
    );
  }
);