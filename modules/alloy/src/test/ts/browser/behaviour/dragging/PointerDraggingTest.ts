import { Chain, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, Scroll, type SugarElement, SugarLocation, SugarNode, SugarPosition } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

// Pointer event helpers — agar has no built-in pointer event support yet
const dispatchPointer = (type: string, element: SugarElement<Node>, dx: number, dy: number, extra: PointerEventInit = {}): void => {
  const location = (SugarNode.isElement(element) ? SugarLocation.absolute(element) : SugarPosition(0, 0)).translate(dx, dy);
  const event = new window.PointerEvent(type, {
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    screenX: location.left,
    screenY: location.top,
    clientX: location.left,
    clientY: location.top,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    bubbles: true,
    cancelable: true,
    ...extra
  });
  element.dom.dispatchEvent(event);
};

const cPointerDown = Chain.op<SugarElement<Node>>((element) => dispatchPointer('pointerdown', element, 0, 0));

const cPointerMoveTo = (dx: number, dy: number): Chain<SugarElement<Node>, SugarElement<Node>> =>
  Chain.op<SugarElement<Node>>((element) => dispatchPointer('pointermove', element, dx, dy));

const cPointerUp = Chain.op<SugarElement<Node>>((element) => dispatchPointer('pointerup', element, 0, 0));

UnitTest.asynctest('PointerDraggingTest', (success, failure) => {

  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          'box-sizing': 'border-box',
          'width': '100px',
          'height': '100px',
          'border': '1px solid green'
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
          getBounds: () => {
            const scroll = Scroll.get();
            return Boxes.bounds(scroll.left, scroll.top, 500, 500);
          }
        })
      ])
    })
  );

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
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
  ), (_doc, _body, gui, component, _store) => {

    const cSubject = Chain.injectThunked(() => subject.get(component).element);

    const cEnsurePositionChanged = Chain.control(
      Chain.binder((all: any) => all.box_position1.left !== all.box_position2.left &&
          all.box_position2.left !== all.box_position3.left ? Result.value({}) :
        Result.error('Positions did not change.\nPosition data: ' + JSON.stringify({
          1: all.box_position1,
          2: all.box_position2,
          3: all.box_position3
        }, null, 2))),
      Guard.addLogging('Ensuring that the position information read from the different stages was different')
    );

    const cEnsureNoBlocker = Chain.control(
      Chain.binder((_all: any) => {
        const blockers = gui.element.dom.querySelectorAll('.test-blocker');
        return blockers.length === 0 ? Result.value({}) :
          Result.error('Expected no blocker element in the DOM during pointer drag, but found ' + blockers.length);
      }),
      Guard.addLogging('Ensuring no blocker div exists during pointer drag')
    );

    const cEnsureBound = Chain.control(
      Chain.binder((all: any) => {
        const boundLeft = all.box_position4.left !== all.box_position5.left &&
          all.box_position5.left === all.box_position6_bound.left &&
          all.box_position5.left === '0px' && all.box_position6_bound.top === '100px';
        const boundRight = all.box_position6_bound.left !== all.box_position7.left &&
          all.box_position7.left === all.box_position8_bound.left &&
          all.box_position7.left === '400px' && all.box_position8_bound.top === '100px';
        return boundLeft && boundRight ? Result.value({}) :
          Result.error('Dragging should have been restricted to the bounds.\nPosition data: ' + JSON.stringify({
            1: all.box_position4,
            2: all.box_position5,
            3: all.box_position6_bound,
            4: all.box_position7,
            5: all.box_position8_bound
          }, null, 2));
      }),
      Guard.addLogging('Checking bounding behaviour at left and right of screen')
    );

    const cEnsureScrollBound = Chain.control(
      Chain.binder((all: any) => {
        const boundBottom = all.box_scrolled_position9.top === all.box_scrolled_position10_bound.top &&
          all.box_scrolled_position9.top === '400px' && all.box_scrolled_position10_bound.left === '50px';
        return boundBottom ? Result.value({}) :
          Result.error('Dragging should have been restricted to the bounds.\nPosition data: ' + JSON.stringify({
            1: all.box_scrolled_position9,
            2: all.box_scrolled_position10_bound
          }, null, 2));
      }),
      Guard.addLogging('Checking bounding behaviour at bottom of screen')
    );

    const cEnsurePinned = Chain.control(
      Chain.binder((all: any) => {
        const pinned = all.box_position11.top !== all.box_position12_pinned.top &&
          all.box_position12_pinned.top === all.box_position13_pinned.top &&
          all.box_position12_pinned.top === '10px';
        return pinned ? Result.value({ }) : Result.error(
          'Box should only have been pinned at 2 and 3 at top: 10px. Positions: ' + JSON.stringify({
            1: all.box_position11,
            2: all.box_position12_pinned,
            3: all.box_position13_pinned
          }, null, 2)
        );
      }),
      Guard.addLogging('Checking pinning behaviour to top of screen')
    );

    const cRecordPosition = Chain.fromChains([
      Chain.control(
        Chain.binder((box) => Css.getRaw(box, 'left').bind((left) => Css.getRaw(box, 'top').map((top) => Result.value({
          left,
          top
        }))).getOrThunk(() => Result.error('No left,top information yet'))),
        Guard.tryUntil('Waiting for position data to record')
      )
    ]);

    const cScrollTo = (x: number, y: number): Chain<any, any> => Chain.op(() => {
      Scroll.to(x, y);
    });

    // With pointer capture, events go directly to the box element (no blocker).
    // Reset: pointerup on the box, then reset position and start a new drag.
    const cReset = Chain.fromChains([
      NamedChain.direct('box', cPointerUp, '_'),

      // Reset positions so every browser behaves identically for bounds/pinning tests
      NamedChain.direct('box', Chain.op((elem) => {
        Css.setAll(elem, {
          left: '50px',
          top: '100px'
        });
      }), '_'),

      NamedChain.direct('box', cPointerDown, '_')
    ]);

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.write('box', cSubject),
          NamedChain.writeValue('container', gui.element),

          // Start drag — pointer events go directly on the box (pointer capture, no blocker)
          NamedChain.direct('box', cPointerDown, '_'),

          // Assert no blocker div was created
          NamedChain.write('_', cEnsureNoBlocker),

          // Basic drag: multiple pointermoves produce cumulative position changes
          NamedChain.direct('box', cPointerMoveTo(100, 200), '_'),
          NamedChain.direct('box', cPointerMoveTo(120, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.direct('box', cPointerMoveTo(140, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.direct('box', cPointerMoveTo(160, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.write('_', cEnsurePositionChanged),

          // Still no blocker after moves
          NamedChain.write('_', cEnsureNoBlocker),

          cReset,

          // Test bounds
          NamedChain.direct('box', cPointerMoveTo(100, 200), '_'),
          NamedChain.direct('box', cPointerMoveTo(50, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position4'),
          NamedChain.direct('box', cPointerMoveTo(0, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position5'),
          NamedChain.direct('box', cPointerMoveTo(-50, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position6_bound'),
          NamedChain.direct('box', cPointerMoveTo(400, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position7'),
          NamedChain.direct('box', cPointerMoveTo(500, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position8_bound'),
          NamedChain.write('_', cEnsureBound),

          // Test bounds when scrolled
          cScrollTo(0, 1000),
          cReset,

          NamedChain.direct('box', cPointerMoveTo(100, 1100), '_'),
          NamedChain.direct('box', cPointerMoveTo(100, 1100), '_'),
          NamedChain.direct('box', cPointerMoveTo(100, 1400), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position9'),
          NamedChain.direct('box', cPointerMoveTo(100, 1500), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position10_bound'),
          NamedChain.write('_', cEnsureScrollBound),

          cScrollTo(0, 0),
          cReset,

          // Test pinning (snap points)
          NamedChain.direct('box', cPointerMoveTo(50, 100), '_'),
          NamedChain.direct('box', cPointerMoveTo(50, 100), '_'),
          NamedChain.direct('box', cPointerMoveTo(50, 60), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position11'),
          NamedChain.direct('box', cPointerMoveTo(50, 30), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position12_pinned'),
          NamedChain.direct('box', cPointerMoveTo(160, 20), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position13_pinned'),
          NamedChain.write('_', cEnsurePinned),

          // Drop resets state — after pointerup, further pointermoves should have no effect
          NamedChain.direct('box', cPointerUp, '_'),
          NamedChain.direct('box', cRecordPosition, 'box_after_drop'),
          NamedChain.direct('box', cPointerMoveTo(300, 300), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_after_stray_move'),
          Chain.control(
            Chain.binder((all: any) => {
              return all.box_after_drop.left === all.box_after_stray_move.left &&
                all.box_after_drop.top === all.box_after_stray_move.top ? Result.value({}) :
                Result.error('Position should not change after drop. Before: ' + JSON.stringify(all.box_after_drop) +
                  ' After: ' + JSON.stringify(all.box_after_stray_move));
            }),
            Guard.addLogging('Ensuring pointermove after pointerup has no effect')
          ),

          Chain.wait(10),
          NamedChain.bundle((output) => Result.value(output))
        ])
      ])
    ];
  }, success, failure);
});
