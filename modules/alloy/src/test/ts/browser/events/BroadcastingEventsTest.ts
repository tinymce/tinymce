import { Cleaner, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Event, window } from '@ephox/dom-globals';
import { DomEvent, Element, EventArgs } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('Browser Test: events.BroadcastingEventsTest', (success, failure) => {

  const cleanup = Cleaner();

  const bodyMargin = [
    'body { margin-top: 2000px; }'
  ];

  GuiSetup.setup((store, doc, body) => GuiFactory.build(
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
        AlloyEvents.run<EventArgs>(SystemEvents.windowScroll(), (component, simulatedEvent) => {
          store.adder(simulatedEvent.event().raw().type)();
        }),
        AlloyEvents.run<EventArgs>(SystemEvents.windowResize(), (component, simulatedEvent) => {
          store.adder(simulatedEvent.event().raw().type)();
        })
      ])
    })
  ), (doc, body, gui, component, store) => {
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
        store.sAssertEq('Should have scrolled', [ 'scroll' ])
      ),
      store.sClear,
      Step.sync(() => {
        window.scrollTo(0, 0);
      }),
      Waiter.sTryUntil(
        'Checking for scrolling message (scrolling back to 0)',
        store.sAssertEq('Should have scrolled', [ 'scroll' ])
      ),
      store.sClear,
      Step.sync(() => {
        // Fake a window resize, by manually triggering a resize event
        if (typeof (Event) === 'function') {
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
        store.sAssertEq('Should have resized', [ 'resize' ])
      ),
      store.sClear,
      GuiSetup.mRemoveStyles
    ];
  }, cleanup.wrap(success), cleanup.wrap(failure));
});
