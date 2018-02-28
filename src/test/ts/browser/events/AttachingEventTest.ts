import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Attr, Body, Traverse } from '@ephox/sugar';
import * as EventRoot from 'ephox/alloy/alien/EventRoot';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import Container from 'ephox/alloy/api/ui/Container';
import TestStore from 'ephox/alloy/test/TestStore';

UnitTest.asynctest('Browser Test: events.AttachingEventTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

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
          AlloyEvents.runOnAttached(function (comp, simulatedEvent) {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element()).getOrDie(
              'At attachedToDom, a DOM parent must exist'
            );
            store.adder('attached-to:' + Attr.get(parent, 'class'))();
          }),

          AlloyEvents.runOnDetached(function (comp, simulatedEvent) {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element()).getOrDie(
              'At detachedFromDom, a DOM parent must exist'
            );
            store.adder('detached-from:' + Attr.get(parent, 'class'))();
          }),

          AlloyEvents.run(SystemEvents.systemInit(), function (comp, simulatedEvent) {
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
    Step.sync(function () {
      RawAssertions.assertEq(
        'Checking that the component has no size',
        0,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),

    store.sAssertEq('Nothing has fired yet', [ ]),

    Step.sync(function () {
      gui.add(wrapper);
      store.assertEq('After adding to system, init should have fired', [ 'init' ]);
    }),

    Step.wait(500),

    Step.sync(function () {
      RawAssertions.assertEq(
        'Even though added to system, not added to DOM yet so still size 0',
        0,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),
    store.sAssertEq('After adding to system and waiting, still only init should have fired', [ 'init' ]),
    store.sClear,

    Step.sync(function () {
      Attachment.attachSystem(Body.body(), gui);
    }),

    Step.sync(function () {
      RawAssertions.assertEq(
        'Now added to the DOM, so should have size 100',
        100,
        wrapper.element().dom().getBoundingClientRect().width
      );
    }),

    store.sAssertEq('After adding to the DOM, should have fired attached', [ 'attached-to:main-container' ]),
    store.sClear,

    Step.sync(function () {
      Attachment.detachSystem(gui);
    }),

    store.sAssertEq('After detaching from the DOM, should have fired detached', [ 'detached-from:main-container' ])
  ], function () { success(); }, failure);
});
