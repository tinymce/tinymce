import { Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { DomEvent, type EventUnbinder, SugarBody, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('MouseDragEventSequenceTest', () => {
  const store = TestStore<string>();

  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          width: '100px',
          height: '100px',
          border: '1px solid green'
        }
      },
      containerBehaviours: Behaviour.derive([
        Dragging.config({
          mode: 'mouse',
          repositionTarget: false,
          blockerClass: 'test-blocker',
          onDragStart: (_comp, _target) => {
            store.add('onDragStart');
          },
          onDrag: (_comp, _targetElem, delta) => {
            store.add(`onDrag(${delta.left}, ${delta.top})`);
          },
          onDrop: (_comp, _target) => {
            store.add('onDrop');
          }
        })
      ])
    })
  );

  const gui = GuiSetup.bddSetup(() => GuiFactory.build(
    Container.sketch({
      dom: { tag: 'div', styles: { 'margin-bottom': '2000px' }},
      components: [ subject.asSpec() ]
    })
  ));

  beforeEach(() => {
    store.clear();
  });

  it('TINY-13585: should fire events in correct order', async () => {
    const component = gui.component();
    const box = subject.get(component);

    Mouse.mouseDown(box.element);
    store.assertEq('onDragStart should fire on mousedown', [ 'onDragStart' ]);

    const blocker = UiFinder.findIn(SugarBody.body(), '.test-blocker').getOrDie();
    Mouse.mouseMoveTo(blocker, 100, 200);
    Mouse.mouseMoveTo(blocker, 120, 200);
    store.assertEq('onDragStart then onDrag', [ 'onDragStart', 'onDrag(20, 0)' ]);

    Mouse.mouseUp(blocker);
    store.assertEq('Full lifecycle: onDragStart, onDrag, onDrop', [ 'onDragStart', 'onDrag(20, 0)', 'onDrop' ]);
  });

  context('with window scrolling', () => {
    const scrollEventBroadcasted = Cell(false);
    let onWindowScroll: EventUnbinder | undefined;

    before(() => {
      window.scrollTo(0, 0);
      scrollEventBroadcasted.set(false);
      onWindowScroll = DomEvent.bind(SugarElement.fromDom(window), 'scroll', (evt) => {
        gui.gui().broadcastEvent(SystemEvents.windowScroll(), evt);
        scrollEventBroadcasted.set(true);
      });
    });

    after(() => {
      onWindowScroll?.unbind();
      window.scrollTo(0, 0);
    });

    it('TINY-13585: should not fire onDragStart again on window scroll during drag', async () => {
      const component = gui.component();
      const box = subject.get(component);

      Mouse.mouseDown(box.element);
      store.assertEq('onDragStart should fire once on mousedown', [ 'onDragStart' ]);

      const blocker = UiFinder.findIn(SugarBody.body(), '.test-blocker').getOrDie();
      Mouse.mouseMoveTo(blocker, 100, 200);
      Mouse.mouseMoveTo(blocker, 120, 200);
      store.assertEq('onDragStart then onDrag', [ 'onDragStart', 'onDrag(20, 0)' ]);

      scrollEventBroadcasted.set(false);
      // Simulate a window scroll during drag — should NOT fire onDragStart again
      window.scrollTo(0, 100);
      await Waiter.pTryUntilPredicate('Wait for scroll event to be handled', () => scrollEventBroadcasted.get());

      store.assertEq('onDragStart should not fire again after scroll', [ 'onDragStart', 'onDrag(20, 0)' ]);

      Mouse.mouseUp(blocker);
      store.assertEq('Full lifecycle: onDragStart, onDrag, onDrop', [ 'onDragStart', 'onDrag(20, 0)', 'onDrop' ]);
    });
  });
});
