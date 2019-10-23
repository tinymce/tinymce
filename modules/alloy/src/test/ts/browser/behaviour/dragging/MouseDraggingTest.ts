import { Chain, Guard, Mouse, NamedChain3 as NamedChain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { Css, Position, Scroll, Element } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { HTMLElement } from '@ephox/dom-globals';

type Pos = {
  left: string;
  top: string;
};

UnitTest.asynctest('MouseDraggingTest', (success, failure) => {

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
          mode: 'mouse',
          blockerClass: 'test-blocker',
          snaps: {
            getSnapPoints() {
              return [
                Dragging.snap({
                  sensor: DragCoord.fixed(300, 10),
                  range: Position(1000, 30),
                  output: DragCoord.fixed(Option.none(), Option.some(10))
                })
              ];
            },
            leftAttr: 'data-snap-left',
            topAttr: 'data-snap-top'
          },
          getBounds: () => {
            const scroll = Scroll.get();
            return Boxes.bounds(scroll.left(), scroll.top(), 500, 500);
          }
        })
      ])
    })
  );

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
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
    );
  }, (doc, body, gui, component, store) => {

    const cSubject = Chain.mapper(() => {
      return subject.get(component).element();
    });

    // box_position1, box_position2, box_position3
    const cEnsurePositionChanged = Chain.control(
      Chain.binder<[Pos, Pos, Pos], {}, string>(([pos1, pos2, pos3]) => {
        return pos1.left !== pos2.left &&
          pos2.left !== pos3.left ? Result.value({}) :
          Result.error('Positions did not change.\nPosition data: ' + JSON.stringify({
            1: pos1,
            2: pos2,
            3: pos3
          }, null, 2));
      }),
      Guard.addLogging('Ensuring that the position information read from the different stages was different')
    );
    const cEnsureBound = Chain.control(
      Chain.binder<[Pos, Pos, Pos, Pos, Pos], {}, string>(([pos4, pos5, pos6_bound, pos7, pos8_bound]) => {
        const boundLeft = pos4.left !== pos5.left &&
          pos5.left === pos6_bound.left &&
          pos5.left === '0px' && pos6_bound.top === '100px';
        const boundRight = pos6_bound.left !== pos7.left &&
          pos7.left === pos8_bound.left &&
          pos7.left === '400px' && pos8_bound.top === '100px';
        return boundLeft && boundRight ? Result.value({}) :
          Result.error('Dragging should have been restricted to the bounds.\nPosition data: ' + JSON.stringify({
            1: pos4,
            2: pos5,
            3: pos6_bound,
            4: pos7,
            5: pos8_bound
          }, null, 2));
      }),
      Guard.addLogging('Checking bounding behaviour at left and right of screen')
    );
    const cEnsureScrollBound = Chain.control(
      Chain.binder<[Pos, Pos], {}, string>(([pos9, pos10_bound]) => {
        const boundBottom = pos9.top === pos10_bound.top &&
          pos9.top === '400px' && pos10_bound.left === '50px';
        return boundBottom ? Result.value({}) :
          Result.error('Dragging should have been restricted to the bounds.\nPosition data: ' + JSON.stringify({
            1: pos9,
            2: pos10_bound
          }, null, 2));
      }),
      Guard.addLogging('Checking bounding behaviour at bottom of screen')
    );
    const cEnsurePinned = Chain.control(
      Chain.binder<[Pos, Pos, Pos], {}, string>(([pos11, pos12_pinned, pos13_pinned]) => {
        const pinned = pos11.top !== pos12_pinned.top &&
          pos12_pinned.top === pos13_pinned.top &&
          pos12_pinned.top === '10px';
        return pinned ? Result.value({}) : Result.error(
          'Box should only have been pinned at 2 and 3 at top: 10px. Positions: ' + JSON.stringify({
            1: pos11,
            2: pos12_pinned,
            3: pos13_pinned
          }, null, 2)
        );
      }),
      Guard.addLogging('Checking pinning behaviour to top of screen')
    );

    const cRecordPosition = Chain.control(
      Chain.binder<Element<HTMLElement>, Pos, string>((box) => {
        return Css.getRaw(box, 'left').bind((left) => {
          return Css.getRaw(box, 'top').map((top) => {
            return Result.value({
              left,
              top
            });
          });
        }).getOrThunk(() => {
          return Result.error('No left,top information yet');
        });
      }),
      Guard.tryUntil('Waiting for position data to record')
    );

    const cScrollTo = <T>(x: number, y: number) => Chain.op<T>(() => {
      Scroll.to(x, y);
    });

    type MDT = {
      blocker: Element<HTMLElement>;
      container: Element<HTMLElement>;
      box: Element<HTMLElement>;
      box_position1: Pos;
      box_position2: Pos;
      box_position3: Pos;
      box_position4: Pos;
      box_position5: Pos;
      box_position6_bound: Pos;
      box_position7: Pos;
      box_position8_bound: Pos;
      box_scrolled_position9: Pos;
      box_scrolled_position10_bound: Pos;
      box_position11: Pos;
      box_position12_pinned: Pos;
      box_position13_pinned: Pos;
    };

    const cReset = NamedChain.fragment<MDT>([
      NamedChain.read('blocker', Mouse.cMouseUp),
      NamedChain.read('container', Chain.control(
        UiFinder.cFindIn('.test-blocker'),
        Guard.tryUntilNot('There should no longer be a blocker')
      )),

      // When testing bounds/pinning, we need every browser to behave identically, so we reset positions
      // so we know what we are dealing with
      NamedChain.read('box', Chain.op((elem) => {
        Css.setAll(elem, {
          left: '50px',
          top: '100px'
        });
      })),

      NamedChain.read('box', Mouse.cMouseDown),
      NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),
    ]);

    return [
      Chain.asStep({}, [
        NamedChain.asEffectChain<MDT>()([
          NamedChain.write(cSubject, 'box'),
          NamedChain.read('box', Mouse.cMouseDown),
          NamedChain.inject(gui.element(), 'container'),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 200)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(120, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.read('blocker', Mouse.cMouseMoveTo(140, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(160, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.readX(NamedChain.getKeys('box_position1', 'box_position2', 'box_position3'), cEnsurePositionChanged),

          cReset,

          // Test bounds
          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 200)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(50, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position4'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(0, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position5'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(-50, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position6_bound'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(400, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position7'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(500, 200)),
          NamedChain.direct('box', cRecordPosition, 'box_position8_bound'),
          NamedChain.readX(NamedChain.getKeys('box_position4', 'box_position5', 'box_position6_bound', 'box_position7', 'box_position8_bound'), cEnsureBound),

          // Test bounds when scrolled
          cScrollTo(0, 1000),
          cReset,

          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 1100)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 1100)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 1400)),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position9'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(100, 1500)),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position10_bound'),
          NamedChain.readX(NamedChain.getKeys('box_scrolled_position9', 'box_scrolled_position10_bound'), cEnsureScrollBound),

          cScrollTo(0, 0),
          cReset,

          // Test pinning.
          NamedChain.read('blocker', Mouse.cMouseMoveTo(50, 100)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(50, 100)),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(50, 60)),
          NamedChain.direct('box', cRecordPosition, 'box_position11'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(50, 30)),
          NamedChain.direct('box', cRecordPosition, 'box_position12_pinned'),
          NamedChain.read('blocker', Mouse.cMouseMoveTo(160, 20)),
          NamedChain.direct('box', cRecordPosition, 'box_position13_pinned'),
          NamedChain.readX(NamedChain.getKeys('box_position11', 'box_position12_pinned', 'box_position13_pinned'), cEnsurePinned),

          Chain.wait(10),
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
