import { Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Attr, Body, Node, Traverse } from '@ephox/sugar';

import * as EventRoot from 'ephox/alloy/alien/EventRoot';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { TestStore } from 'ephox/alloy/api/testhelpers/TestStore';

UnitTest.asynctest('Browser Test: events.AttachingEventTest', (success, failure) => {

  const gui = Gui.takeover(
    GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'outer-container' ]
        }
      })
    )
  );

  const store = TestStore();

  const wrapper = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'main-container' ],
      styles: {
        width: '100px',
        height: '100px'
      }
    },
    components: [
      Container.sketch({
        events: AlloyEvents.derive([
          AlloyEvents.runOnAttached((comp, simulatedEvent) => {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element()).filter(Node.isElement).getOrDie(
              'At attachedToDom, a DOM parent must exist'
            );
            store.adder('attached-to:' + Attr.get(parent, 'class'))();
          }),

          AlloyEvents.runOnDetached((comp, simulatedEvent) => {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element()).filter(Node.isElement).getOrDie(
              'At detachedFromDom, a DOM parent must exist'
            );
            store.adder('detached-from:' + Attr.get(parent, 'class'))();
          }),

          AlloyEvents.run(SystemEvents.systemInit(), (comp, simulatedEvent) => {
            if (EventRoot.isSource(comp, simulatedEvent)) {
              simulatedEvent.stop();
              store.adder('init')();
            }
          })
        ])
      })
    ]
  });

  Pipeline.async({}, [
    Step.sync(() => {
      Assert.eq(
        'Checking that the component has no size',
        0,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),

    store.sAssertEq('Nothing has fired yet', [ ]),

    Step.sync(() => {
      gui.add(wrapper);
      store.assertEq('After adding to system, init should have fired', [ 'init' ]);
    }),

    Step.wait(500),

    Step.sync(() => {
      Assert.eq(
        'Even though added to system, not added to DOM yet so still size 0',
        0,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),
    store.sAssertEq('After adding to system and waiting, still only init should have fired', [ 'init' ]),
    store.sClear,

    Step.sync(() => {
      Attachment.attachSystem(Body.body(), gui);
    }),

    Step.sync(() => {
      Assert.eq(
        'Now added to the DOM, so should have size 100',
        100,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),

    store.sAssertEq('After adding to the DOM, should have fired attached', [ 'attached-to:main-container' ]),
    store.sClear,

    Step.sync(() => {
      Attachment.detachSystem(gui);
    }),

    store.sAssertEq('After detaching from the DOM, should have fired detached', [ 'detached-from:main-container' ])
  ], () => { success(); }, failure);
});
