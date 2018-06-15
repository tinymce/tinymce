import { Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('Browser Test: events.BroadcastingEventsTest', (success, failure) => {



  const bodyMargin = [
    'body { margin-top: 2000px; }'
  ];

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          styles: {
            'overflow-x': 'hidden',
            'background': 'blue',
            'max-width': '300px',
            'height': '20px'
          }
        },
        events: AlloyEvents.derive([
          AlloyEvents.run(SystemEvents.windowScroll(), (component, simulatedEvent) => {
            store.adder(simulatedEvent.event().raw().type)();
          })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      GuiSetup.mAddStyles(doc, bodyMargin),
      store.sClear,
      Step.sync(() => {
        window.scrollTo(0, 100);
      }),
      Waiter.sTryUntil(
        'Checking for scrolling message',
        store.sAssertEq('Should have scrolled', [ 'scroll' ]),
        100,
        1000
      ),
      store.sClear,
      Step.sync(() => {
        window.scrollTo(0, 0);
      }),
      Waiter.sTryUntil(
        'Checking for scrolling message (scrolling back to 0)',
        store.sAssertEq('Should have scrolled', [ 'scroll' ]),
        100,
        1000
      ),
      store.sClear,
      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
