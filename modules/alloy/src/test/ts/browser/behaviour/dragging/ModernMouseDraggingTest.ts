import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Css, Scroll, type SugarElement, SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('ModernMouseDraggingTest', () => {
  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          'box-sizing': 'border-box',
          'width': '100px',
          'height': '100px',
          'background-color': 'green',
          'border': '1px solid green'
        }
      },
      containerBehaviours: Behaviour.derive([
        Dragging.config({
          mode: 'mouse',
          blockerClass: 'test-blocker',
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
          getBounds: () => {
            const scroll = Scroll.get();
            return Boxes.bounds(scroll.left, scroll.top, 500, 500);
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

  const waitForPosition = (box: ReturnType<typeof subject.get>) =>
    Waiter.pTryUntil('Waiting for position data', () => {
      const left = Css.getRaw(box.element, 'left').getOrDie('No left position');
      const top = Css.getRaw(box.element, 'top').getOrDie('No top position');
      return { left, top };
    });

  const startDrag = async (left = '50px', top = '100px') => {
    const component = gui.component();
    const box = subject.get(component);

    Css.setAll(box.element, { left, top });
    Mouse.mouseDown(box.element);
    const blocker = await UiFinder.pWaitFor('Waiting for blocker', gui.gui().element, '.test-blocker');

    return { box, blocker };
  };

  const endDrag = (blocker: SugarElement<Element>) => {
    Mouse.mouseUp(blocker);
  };

  it('should move the element when dragged', async () => {
    const { box, blocker } = await startDrag();

    Mouse.mouseMoveTo(blocker, 100, 200);
    Mouse.mouseMoveTo(blocker, 120, 200);
    const pos1 = await waitForPosition(box);

    Mouse.mouseMoveTo(blocker, 140, 200);
    const pos2 = await waitForPosition(box);

    Mouse.mouseMoveTo(blocker, 160, 200);
    const pos3 = await waitForPosition(box);

    assert.notEqual(pos1.left, pos2.left, 'Position should change between move 1 and 2');
    assert.notEqual(pos2.left, pos3.left, 'Position should change between move 2 and 3');

    endDrag(blocker);
  });

  it('should clamp to left and right bounds', async () => {
    const { box, blocker } = await startDrag();

    Mouse.mouseMoveTo(blocker, 100, 200);
    Mouse.mouseMoveTo(blocker, 50, 200);

    // Drag to left edge
    Mouse.mouseMoveTo(blocker, 0, 200);
    const posAtLeftEdge = await waitForPosition(box);

    // Drag past left edge — should be clamped
    Mouse.mouseMoveTo(blocker, -50, 200);
    const posPastLeft = await waitForPosition(box);

    assert.equal(posAtLeftEdge.left, '0px', 'Should hit left bound at 0px');
    assert.equal(posPastLeft.left, '0px', 'Should stay clamped at left bound');

    assert.equal(posAtLeftEdge.top, '100px', 'Vertical position should not change');
    assert.equal(posPastLeft.top, '100px', 'Vertical position should not change');

    // Drag to right edge (bounds 500 - box width 100 = 400)
    Mouse.mouseMoveTo(blocker, 400, 200);
    const posAtRightEdge = await waitForPosition(box);

    // Drag past right edge — should be clamped
    Mouse.mouseMoveTo(blocker, 500, 200);
    const posPastRight = await waitForPosition(box);

    assert.equal(posAtRightEdge.left, '400px', 'Should hit right bound at 400px');
    assert.equal(posPastRight.left, '400px', 'Should stay clamped at right bound');
    assert.equal(posPastRight.top, '100px', 'Vertical position should not change');

    endDrag(blocker);
  });

  it('should clamp to bottom bound when scrolled', async () => {
    Scroll.to(0, 1000);
    const { box, blocker } = await startDrag();

    // Warm up
    Mouse.mouseMoveTo(blocker, 100, 1100);
    Mouse.mouseMoveTo(blocker, 100, 1100);

    // Drag to bottom edge (scroll 1000 + bounds 500 - box height 100 = 1400)
    Mouse.mouseMoveTo(blocker, 100, 1400);
    const posAtBottomEdge = await waitForPosition(box);

    // Drag past bottom edge — should be clamped
    Mouse.mouseMoveTo(blocker, 100, 1500);
    const posPastBottom = await waitForPosition(box);

    assert.equal(posAtBottomEdge.top, '400px', 'Should hit bottom bound at 400px');
    assert.equal(posPastBottom.top, '400px', 'Should stay clamped at bottom bound');
    assert.equal(posPastBottom.left, '50px', 'Horizontal position should not change');

    endDrag(blocker);
    Scroll.to(0, 0);
  });

  it('should snap to a snap point when dragged within range', async () => {
    const { box, blocker } = await startDrag();

    // Warm up
    Mouse.mouseMoveTo(blocker, 50, 100);
    Mouse.mouseMoveTo(blocker, 50, 100);

    // Drag to y=60 — outside snap range (more than 30px from sensor at y=10)
    Mouse.mouseMoveTo(blocker, 50, 60);
    const posBeforeSnap = await waitForPosition(box);

    // Drag to y=30 — within 30px of sensor at y=10, snap activates
    Mouse.mouseMoveTo(blocker, 50, 30);
    const posSnapped = await waitForPosition(box);

    // Drag to (160, 20) — still within snap range, moved horizontally too
    Mouse.mouseMoveTo(blocker, 160, 20);
    const posStillSnapped = await waitForPosition(box);

    assert.notEqual(posBeforeSnap.top, posSnapped.top, 'Position should change when entering snap zone');
    assert.equal(posSnapped.top, '10px', 'Should snap to top: 10px');
    assert.equal(posStillSnapped.top, '10px', 'Should stay pinned at top: 10px');

    endDrag(blocker);
  });
});
