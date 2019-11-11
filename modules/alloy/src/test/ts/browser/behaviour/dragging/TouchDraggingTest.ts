import { Chain, Guard, NamedChain, Touch, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, Position, Scroll } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('TouchDraggingTest', (success, failure) => {
  // Override isTouch() to make Alloy listen to touch events
  const origPlatform = PlatformDetection.detect();
  PlatformDetection.override({
    deviceType: {
      ...origPlatform.deviceType,
      isTouch: () => true
    }
  });

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
          mode: 'touch',
          blockerClass: 'test-blocker',
          snaps: {
            getSnapPoints () {
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

    const cEnsurePositionChanged = Chain.control(
      Chain.binder((all: any) => {
        return all.box_position1.left !== all.box_position2.left &&
          all.box_position2.left !== all.box_position3.left ? Result.value({}) :
          Result.error('Positions did not change.\nPosition data: ' + JSON.stringify({
            1: all.box_position1,
            2: all.box_position2,
            3: all.box_position3
          }, null, 2));
      }),
      Guard.addLogging('Ensuring that the position information read from the different stages was different')
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
        Chain.binder((box) => {
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
      )
    ]);

    const cScrollTo = (x: number, y: number) => Chain.op(() => {
      Scroll.to(x, y);
    });

    const cReset = Chain.fromChains([
      NamedChain.direct('blocker', Touch.cTouchEnd, '_'),
      NamedChain.direct('container', Chain.control(
        UiFinder.cFindIn('.test-blocker'),
        Guard.tryUntilNot('There should no longer be a blocker')
      ), 'blocker'),

      // When testing bounds/pinning, we need every browser to behave identically, so we reset positions
      // so we know what we are dealing with
      NamedChain.direct('box', Chain.op((elem) => {
        Css.setAll(elem, {
          left: '50px',
          top: '100px'
        });
      }), '_'),

      NamedChain.direct('box', Touch.cTouchStart, '_'),
      NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),
    ]);

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.write('box', cSubject),
          NamedChain.direct('box', Touch.cTouchStart, '_'),
          NamedChain.writeValue('container', gui.element()),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 200), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(120, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.direct('blocker', Touch.cTouchMoveTo(140, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(160, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.write('_', cEnsurePositionChanged),

          cReset,

          // Touch move on component (box)
          NamedChain.direct('box', Touch.cTouchMoveTo(100, 200), '_'),
          NamedChain.direct('box', Touch.cTouchMoveTo(120, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.direct('box', Touch.cTouchMoveTo(140, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.direct('box', Touch.cTouchMoveTo(160, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.write('_', cEnsurePositionChanged),

          cReset,

          // Test bounds
          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 200), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(50, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position4'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(0, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position5'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(-50, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position6_bound'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(400, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position7'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(500, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position8_bound'),
          NamedChain.write('_', cEnsureBound),

          // Test bounds when scrolled
          cScrollTo(0, 1000),
          cReset,

          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 1100), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 1100), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 1400), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position9'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(100, 1500), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_scrolled_position10_bound'),
          NamedChain.write('_', cEnsureScrollBound),

          cScrollTo(0, 0),
          cReset,

          // Test pinning.
          NamedChain.direct('blocker', Touch.cTouchMoveTo(50, 100), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(50, 100), '_'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(50, 60), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position11'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(50, 30), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position12_pinned'),
          NamedChain.direct('blocker', Touch.cTouchMoveTo(160, 20), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position13_pinned'),
          NamedChain.write('_', cEnsurePinned),

          Chain.wait(10),
          NamedChain.bundle((output) => {
            return Result.value(output);
          })
        ])
      ])
    ];
  }, () => {
    PlatformDetection.override(origPlatform);
    success();
  }, (err, logs) => {
    PlatformDetection.override(origPlatform);
    failure(err, logs);
  });
});
