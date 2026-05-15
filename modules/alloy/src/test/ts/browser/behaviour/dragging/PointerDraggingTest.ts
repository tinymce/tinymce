import { Pointer } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Css, Scroll, SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import type { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('PointerDraggingTest', () => {
  const assertPosition = (label: string, box: AlloyComponent, expected: { left: string; top: string }) => {
    const top = Css.getRaw(box.element, 'top').getOrDie('No top position');
    const left = Css.getRaw(box.element, 'left').getOrDie('No left position');
    assert.equal(left, expected.left, `${label} (left)`);
    assert.equal(top, expected.top, `${label} (top)`);
  };

  context('bounds', () => {
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
            getBounds: () => {
              const scroll = Scroll.get();
              return Boxes.bounds(scroll.left + 20, scroll.top + 20, 480, 480);
            }
          })
        ])
      })
    );

    const gui = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'div',
          styles: {
            'margin-bottom': '2000px'
          }
        },
        components: [
          subject.asSpec()
        ]
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

    it('TINY-14241: should move the element when dragged', async () => {
      const { box } = await getElementToDrag();
      const store = gui.store();

      await Pointer.pWithMockPointerCapture(box.element, {
        setPointerCapture: store.adder('setPointerCapture'),
        releasePointerCapture: store.adder('releasePointerCapture')
      }, async () => {
        Pointer.pointerDown(box.element);
        store.assertEq('setPointerCapture should be called', [ 'setPointerCapture' ]);

        Pointer.pointerMoveBy(box.element, 0, 0);
        Pointer.pointerMoveBy(box.element, 20, 0);
        assertPosition('Position should move by [20, 0]', box, { left: '70px', top: '100px' });

        Pointer.pointerMoveBy(box.element, 20, 0);
        assertPosition('Position should move by [20, 0]', box, { left: '90px', top: '100px' });

        Pointer.pointerMoveBy(box.element, 20, 50);
        assertPosition('Position should move by [20, 50]', box, { left: '110px', top: '150px' });

        Pointer.pointerUp(box.element);
      });

      store.assertEq('setPointerCapture and releasePointerCapture should be called', [ 'setPointerCapture', 'releasePointerCapture' ]);
    });

    const pAssertClampToBounds = async (box: AlloyComponent) => {
      await Pointer.pWithMockPointerCapture(box.element, {}, async () => {
        Pointer.pointerDown(box.element);
        Pointer.pointerMoveBy(box.element, 0, 0);
        Pointer.pointerMoveBy(box.element, -30, 0); // Drag to the left edge
        assertPosition('Element should be on the left edge', box, { left: '20px', top: '100px' });

        Pointer.pointerMoveBy(box.element, -100, 0); // Drag past left edge — should be clamped
        assertPosition('Element should be on the left edge', box, { left: '20px', top: '100px' });
        Pointer.pointerUp(box.element);

        Pointer.pointerDown(box.element);
        Pointer.pointerMoveBy(box.element, 0, 0);
        Pointer.pointerMoveBy(box.element, 380, 0); // Drag to right edge (bounds 500 - left bound start 20 - box width 100 = 380)
        assertPosition('Element should be on the right edge', box, { left: '400px', top: '100px' });

        Pointer.pointerMoveBy(box.element, 100, 0); // Drag past right edge — should be clamped
        assertPosition('Element should be on the right edge', box, { left: '400px', top: '100px' });
        Pointer.pointerUp(box.element);

        Pointer.pointerDown(box.element);
        Pointer.pointerMoveBy(box.element, 0, 0);
        Pointer.pointerMoveBy(box.element, 0, -80); // Drag to the top edge
        assertPosition('Element should be on the top edge', box, { left: '400px', top: '20px' });

        Pointer.pointerMoveBy(box.element, 0, -100); // Drag past top edge — should be clamped
        assertPosition('Element should be on the top edge', box, { left: '400px', top: '20px' });
        Pointer.pointerUp(box.element);

        Pointer.pointerDown(box.element);
        Pointer.pointerMoveBy(box.element, 0, 0);
        Pointer.pointerMoveBy(box.element, 0, 380); // Drag to the bottom edge
        assertPosition('Element should be on the bottom edge', box, { left: '400px', top: '400px' });

        Pointer.pointerMoveBy(box.element, 0, 100); // Drag past bottom edge — should be clamped
        assertPosition('Element should be on the bottom edge', box, { left: '400px', top: '400px' });

        Pointer.pointerUp(box.element);
      });
    };

    it('TINY-14241: should clamp to bounds', async () => {
      const { box } = await getElementToDrag();
      await pAssertClampToBounds(box);
    });

    it('TINY-14241: should clamp to bounds when scrolled', async () => {
      Scroll.to(0, 1000);
      try {
        const { box } = await getElementToDrag();
        await pAssertClampToBounds(box);
      } finally {
        Scroll.to(0, 0);
      }
    });
  });

  context('snapping', () => {
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
            snaps: {
              getSnapPoints: () => [
                Dragging.snap({
                  sensor: DragCoord.fixed(300, 10),
                  range: SugarPosition(1000, 30),
                  output: DragCoord.fixed(Optional.none<number>(), Optional.some(10))
                })
              ],
              leftAttr: 'data-snap-left',
              topAttr: 'data-snap-top'
            },
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

    it('TINY-14241: should snap to a snap point when dragged within range', async () => {
      const { box } = await getElementToDrag();

      await Pointer.pWithMockPointerCapture(box.element, {}, async () => {
        Pointer.pointerDown(box.element);
        Pointer.pointerMoveBy(box.element, 0, 0); // Warm up
        Pointer.pointerMoveBy(box.element, 0, 0);

        // Drag to y=50 — outside snap range
        Pointer.pointerMoveBy(box.element, 0, -50);
        assertPosition('Element should follow cursor', box, { left: '50px', top: '50px' });

        // Drag to y=30 — within 30px of sensor at y=10, snap activates
        Pointer.pointerMoveBy(box.element, 0, -20);
        assertPosition('Element should snap to snapping point', box, { left: '50px', top: '10px' });

        Pointer.pointerMoveBy(box.element, 110, -10);
        assertPosition('Element should stay snapped to snapping point', box, { left: '160px', top: '10px' });

        Pointer.pointerUp(box.element);
      });
    });
  });
});
