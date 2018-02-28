import { Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Obj, Struct } from '@ephox/katamari';
import * as ComponentEvents from 'ephox/alloy/construct/ComponentEvents';
import * as EventHandler from 'ephox/alloy/construct/EventHandler';
import ResultAssertions from 'ephox/alloy/test/ResultAssertions';
import TestStore from 'ephox/alloy/test/TestStore';

UnitTest.test('ComponentEventsTest', function () {
  // TODO: This needs to be restructured because events and behaviours have changed.
  const behaviour = Struct.immutable('name', 'handlers');

  const store = TestStore();

  const base = {
    'base.behaviour': {
      'event.0': EventHandler.nu({
        run: store.adder('base.0')
      })
    }
  };

  const checkErr = function (expectedPart, info, behaviours) {
    ResultAssertions.checkErr(
      'Checking error combined events',
      expectedPart,
      function () {
        return ComponentEvents.combine(info, info.eventOrder(), behaviours, base);
      }
    );
  };

  const check = function (expected, info, behaviours) {
    ResultAssertions.checkVal(
      'Checking value of combined events',
      function () {
        store.clear();
        return ComponentEvents.combine(info, info.eventOrder(), behaviours, base);
      },
      function (value) {
        const events = Obj.keys(value).sort();
        Arr.each(events, function (eventName) {
          value[eventName].handler('component', {
            stop: store.adder(eventName + '.stop')
          });
        });

        store.assertEq('Checking combined api', expected);
      }
    );
  };

  const eo = function (eventOrder) {
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
              can () {
                store.adder('a.three.cannot')();
                return false;
              },
              run: store.adder('a.three')
            })
          }),
          behaviour('b.behaviour', {
            'event.3': EventHandler.nu({
              run: store.adder('b.three'),
              abort () {
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
              can () {
                store.adder('a.three.cannot')();
                return false;
              },
              run: store.adder('a.three')
            })
          }),
          behaviour('b.behaviour', {
            'event.3': EventHandler.nu({
              run: store.adder('b.three'),
              abort () {
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
        [ 'base.0', 'a.one', 'a.two', 'b.three.abort', 'event.3.stop' ],
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
              can () {
                store.adder('a.three.cannot')();
                return false;
              },
              run: store.adder('a.three')
            })
          }),
          behaviour('b.behaviour', {
            'event.3': EventHandler.nu({
              run: store.adder('b.three'),
              abort () {
                store.adder('b.three.abort')();
                return true;
              }
            })
          })
        ]
      );
    }
  );
});
