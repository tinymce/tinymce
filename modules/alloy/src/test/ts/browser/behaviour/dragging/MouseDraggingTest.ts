import { Chain, Guard, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Css, Position } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('MouseDraggingTest', (success, failure) => {

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
          }
        })
      ])
    })
  );

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
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
          Result.error('Positions did not change.\nPosition data: ' + Json.stringify({
            1: all.box_position1,
            2: all.box_position2,
            3: all.box_position3
          }, null, 2));
      }),
      Guard.addLogging('Ensuring that the position information read from the different stages was different')
    );
    const cEnsurePinned = Chain.control(
      Chain.binder((all: any) => {
        const pinned = all.box_position4.top !== all.box_position5_pinned.top &&
          all.box_position5_pinned.top === all.box_position6_pinned.top &&
          all.box_position5_pinned.top === '10px';
        return pinned ? Result.value({ }) : Result.error(
          'Box should only have been pinned at 2 and 3 at top: 10px. Positions: ' + Json.stringify({
            1: all.box_position4,
            2: all.box_position5_pinned,
            3: all.box_position6_pinned
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
        Guard.tryUntil('Waiting for position data to record', 100, 1000)
      )
    ]);

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.write('box', cSubject),
          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.writeValue('container', gui.element()),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.direct('blocker', Mouse.cMouseMoveTo(100, 200), '_'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(120, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.direct('blocker', Mouse.cMouseMoveTo(140, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(160, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.write('_', cEnsurePositionChanged),

          NamedChain.direct('blocker', Mouse.cMouseUp, '_'),
          NamedChain.direct('container', Chain.control(
            UiFinder.cFindIn('.test-blocker'),
            Guard.tryUntilNot('There should no longer be a blocker', 100, 100)
          ), 'blocker'),

          // When testing pinning, we need every browser to behave identically, so we reset positions
          // so we know what we are dealing with
          NamedChain.direct('box', Chain.op((elem) => {
            Css.setAll(elem, {
              left: '50px',
              top: '100px'
            });
          }), '_'),

          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          // Test pinning.
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(50, 100), '_'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(50, 100), '_'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(50, 60), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position4'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(50, 30), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position5_pinned'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(160, 20), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position6_pinned'),
          NamedChain.write('_', cEnsurePinned),

          Chain.wait(10),
          NamedChain.bundle((output) => {
            return Result.value(output);
          })
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
