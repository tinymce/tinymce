import { Step } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: events.BroadcastingEventsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var bodyMargin = [
    'body { margin-top: 2000px; }'
  ];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          styles: {
            'overflow-x': 'hidden',
            background: 'blue',
            'max-width': '300px',
            height: '20px'
          }
        },
        events: AlloyEvents.derive([
          AlloyEvents.run(SystemEvents.windowScroll(), function (component, simulatedEvent) {
            store.adder(simulatedEvent.event().raw().type)();
          })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      GuiSetup.mAddStyles(doc, bodyMargin),
      Step.sync(function () {
        window.scrollTo(0, 100);
      }),
      Waiter.sTryUntil(
        'Checking for scrolling message',
        store.sAssertEq('Should have scrolled', [ 'scroll' ]),
        100,
        1000
      ),
      GuiSetup.mRemoveStyles
    ];
  }, function () { success(); }, failure);
});

