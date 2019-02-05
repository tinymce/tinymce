import { Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';
import { window, Event } from '@ephox/dom-globals';
import { DomEvent, Element } from '@ephox/sugar';
import { Cleaner } from '../../module/ephox/alloy/test/Cleaner';

UnitTest.asynctest('Browser Test: events.BroadcastingEventsTest', (success, failure) => {

  const cleanup = Cleaner();

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
          AlloyEvents.run<SugarEvent>(SystemEvents.windowScroll(), (component, simulatedEvent) => {
            store.adder(simulatedEvent.event().raw().type)();
          }),
          AlloyEvents.run<SugarEvent>(SystemEvents.windowResize(), (component, simulatedEvent) => {
            store.adder(simulatedEvent.event().raw().type)();
          })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {
    cleanup.add(
      DomEvent.bind(Element.fromDom(window), 'scroll', (evt) => {
        gui.broadcastEvent(SystemEvents.windowScroll(), evt);
      }).unbind
    );
    cleanup.add(
      DomEvent.bind(Element.fromDom(window), 'resize', (evt) => {
        gui.broadcastEvent(SystemEvents.windowResize(), evt);
      }).unbind
    );
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
      Step.sync(() => {
        // Fake a window resize, by manually triggering a resize event
        if (typeof(Event) === 'function') {
          // modern browsers
          window.dispatchEvent(new Event('resize'));
        } else {
          // for IE and other old browsers
          const evt = window.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, window, 0);
          window.dispatchEvent(evt);
        }
      }),
      Waiter.sTryUntil(
        'Checking for resize message',
        store.sAssertEq('Should have resized', [ 'resize' ]),
        100,
        1000
      ),
      store.sClear,
      GuiSetup.mRemoveStyles
    ];
  }, cleanup.wrap(success), cleanup.wrap(failure));
});
