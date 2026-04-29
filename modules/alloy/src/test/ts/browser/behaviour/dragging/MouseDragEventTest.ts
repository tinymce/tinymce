import { Assertions, Chain, Mouse, NamedChain, TestStore, type TestStore as TestStoreType, UiFinder, Waiter } from '@ephox/agar';
import { after, before, beforeEach, context, describe, it, UnitTest } from '@ephox/bedrock-client';
import { Cell, Result } from '@ephox/katamari';
import { Css, DomEvent, type EventUnbinder, SugarBody, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

interface StoreMouseDragEventTest {
  readonly left: number;
  readonly top: number;
}

UnitTest.asynctest('MouseDragEventTest', (success, failure) => {
  GuiSetup.setup((store: TestStoreType<StoreMouseDragEventTest>, _doc, _body) => GuiFactory.build(
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
          onDrag: (_comp, _targetElem, delta) => {
            store.adder({ left: delta.left, top: delta.top })();
          }
        })
      ])
    })
  ), (_doc, _body, gui, component, store) => {
    const cAssertNoPositionInfo = Chain.op((box: SugarElement<HTMLElement>) => {
      Assertions.assertEq('Should be no "left"', true, Css.getRaw(box, 'left').isNone());
      Assertions.assertEq('Should be no "top"', true, Css.getRaw(box, 'top').isNone());
    });

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          store.cClear,
          NamedChain.writeValue('box', component.element),
          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.writeValue('container', gui.element),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.direct('blocker', Mouse.cMouseMoveTo(100, 200), '_'),
          store.cAssertEq('Checking that no drag events have fired yet', [ ]),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(120, 200), '_'),
          store.cAssertEq('Checking that a drag event has fired with (20, 0) delta', [{ left: 20, top: 0 }]),
          NamedChain.direct('box', cAssertNoPositionInfo, '_'),
          NamedChain.direct('blocker', Mouse.cMouseUp, '_'),
          store.cClear,

          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(300, 100), '_'),
          store.cAssertEq('The state should have been reset, so one position should not give us a delta', [ ]),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(303, 100), '_'),
          store.cAssertEq('The state should have been reset, so two positions should give us a delta of (3, 0)', [{ left: 3, top: 0 }]),
          NamedChain.bundle((output) => Result.value(output))
        ])
      ])
    ];
  }, success, failure);
});

describe('MouseDragEventTest (BDD)', () => {
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

      // Simulate a window scroll during drag — should NOT fire onDragStart again
      window.scrollTo(0, 100);
      await Waiter.pTryUntilPredicate('Wait for scroll event to be handled', () => scrollEventBroadcasted.get());

      store.assertEq('onDragStart should not fire again after scroll', [ 'onDragStart', 'onDrag(20, 0)' ]);

      Mouse.mouseUp(blocker);
      store.assertEq('Full lifecycle: onDragStart, onDrag, onDrop', [ 'onDragStart', 'onDrag(20, 0)', 'onDrop' ]);
    });
  });
});
