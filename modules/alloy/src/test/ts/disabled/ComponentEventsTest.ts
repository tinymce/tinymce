import { Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Obj, Struct } from '@ephox/katamari';
import * as ComponentEvents from 'ephox/alloy/construct/ComponentEvents';
import * as EventHandler from 'ephox/alloy/construct/EventHandler';
import * as ResultAssertions from 'ephox/alloy/test/ResultAssertions';
import TestStore from 'ephox/alloy/api/testhelpers/TestStore';

UnitTest.test('ComponentEventsTest', () => {
  const behaviour = Struct.immutable('name', 'handlers');

  const store = TestStore();

  const base = {
    'base.behaviour': {
      'event.0': EventHandler.nu({
        run: store.adder('base.0')
      })
    }
  };

  const checkErr = (expectedPart, info, behaviours) => {
    ResultAssertions.checkErr(
      'Checking error combined events',
      expectedPart,
      () => {
        return ComponentEvents.combine(info, info.eventOrder(), behaviours, base);
      }
    );
  };

  const check = (expected, info, behaviours) => {
    ResultAssertions.checkVal(
      'Checking value of combined events',
      () => {
        store.clear();
        return ComponentEvents.combine(info, info.eventOrder(), behaviours, base);
      },
      (value) => {
        const events = Obj.keys(value).sort();
        Arr.each(events, (eventName) => {
          value[eventName].handler('component', {
            stop: store.adder(eventName + '.stop')
          });
        });

        store.assertEq('Checking combined api', expected);
      }
    );
  };

  const eo = (eventOrder) => {
    return {
      eventOrder: Fun.constant(eventOrder)
    };
  };

  Logger.sync(
    'Testing no behaviours',
    () => {
      check([
        'base.0'
      ], eo({}), [ ]);
    }
  );

  Logger.sync(
    'Testing 1 behaviour with 1 event',
    () => {
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
    () => {
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
    () => {
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
    () => {
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
    () => {
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
