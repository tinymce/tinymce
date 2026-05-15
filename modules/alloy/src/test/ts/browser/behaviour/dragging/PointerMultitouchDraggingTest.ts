import { Pointer } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';
import { assert } from 'chai';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import type { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('PointerMultitouchDraggingTest', () => {
  const assertPosition = (label: string, box: AlloyComponent, expected: { left: string; top: string }) => {
    const top = Css.getRaw(box.element, 'top').getOrDie('No top position');
    const left = Css.getRaw(box.element, 'left').getOrDie('No left position');
    assert.equal(left, expected.left, `${label} (left)`);
    assert.equal(top, expected.top, `${label} (top)`);
  };

  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          'width': '100px',
          'height': '100px',
          'background-color': 'green',
          'position': 'fixed'
        }
      },
      containerBehaviours: Behaviour.derive([
        Dragging.config({
          mode: 'pointer',
        })
      ])
    })
  );

  const gui = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: { tag: 'div' },
      components: [ subject.asSpec() ]
    })
  ));

  const getElementToDrag = async (left = '50px', top = '100px') => {
    const component = gui.component();
    const box = subject.get(component);
    Css.setAll(box.element, { left, top });
    return { box };
  };

  beforeEach(() => {
    const store = gui.store();
    store.clear();
  });

  it('TINY-14241: pointer move from second pointer should not affect the drag', async () => {
    const { box } = await getElementToDrag();

    await Pointer.pWithMockPointerCapture(box.element, {}, async () => {
      Pointer.pointerDown(box.element, { pointerId: 1 });
      Pointer.pointerMoveBy(box.element, 0, 0, { pointerId: 1 });
      Pointer.pointerMoveBy(box.element, 20, 30, { pointerId: 1 });
      assertPosition('Should move with pointer 1', box, { left: '70px', top: '130px' });

      // Second finger touches and moves
      Pointer.pointerDown(box.element, { pointerId: 2 });
      Pointer.pointerMoveBy(box.element, 50, 50, { pointerId: 2 });
      assertPosition('Should not move from pointer 2 move', box, { left: '70px', top: '130px' });

      Pointer.pointerUp(box.element, { pointerId: 1 });
      Pointer.pointerUp(box.element, { pointerId: 2 });
    });
  });

  it('TINY-14241: pointer up from second pointer should not stop the drag', async () => {
    const { box } = await getElementToDrag();
    const store = gui.store();

    await Pointer.pWithMockPointerCapture(box.element, {
      setPointerCapture: (pointerId) => store.add(`setPointerCapture(${pointerId})`),
      releasePointerCapture: (pointerId) => store.add(`releasePointerCapture(${pointerId})`)
    }, async () => {
      Pointer.pointerDown(box.element, { pointerId: 1 });
      Pointer.pointerMoveBy(box.element, 0, 0, { pointerId: 1 });
      Pointer.pointerMoveBy(box.element, 20, 30, { pointerId: 1 });
      assertPosition('Should move with pointer 1', box, { left: '70px', top: '130px' });

      // Second finger touches and lifts
      Pointer.pointerDown(box.element, { pointerId: 2 });
      Pointer.pointerUp(box.element, { pointerId: 2 });

      // Pointer 1 should still be dragging
      Pointer.pointerMoveBy(box.element, 10, 10, { pointerId: 1 });
      assertPosition('Drag should still be active after pointer 2 up', box, { left: '80px', top: '140px' });

      Pointer.pointerUp(box.element, { pointerId: 1 });
    });

    store.assertEq('Only pointer 1 should trigger capture/release', [ 'setPointerCapture(1)', 'releasePointerCapture(1)' ]);
  });
});
