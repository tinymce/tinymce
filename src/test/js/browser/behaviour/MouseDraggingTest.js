import { Chain } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Clicks } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Dragging from 'ephox/alloy/api/behaviour/Dragging';
import Container from 'ephox/alloy/api/ui/Container';
import DragCoord from 'ephox/alloy/api/data/DragCoord';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { JSON as Json } from '@ephox/sand';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('MouseDraggingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          'width': '100px',
          height: '100px',
          border: '1px solid green'
        }
      },
      containerBehaviours: Behaviour.derive([
        Dragging.config({
          mode: 'mouse',
          blockerClass: 'test-blocker',
          snaps: {
            getSnapPoints: function () {
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

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        components: [
          subject.asSpec()
        ]
      })
    );
  }, function (doc, body, gui, component, store) {

    var cSubject = Chain.mapper(function () {
      return subject.get(component).element();
    });

    // FIX: Add mousedown to agar API.
    var cMousedown = Chain.op(Clicks.mousedown);

    var cMouseup = Chain.op(Clicks.mouseup);

    var cMousemoveTo = function (x, y) {
      return Chain.op(function (elem) {
        Clicks.mousemove(elem, x, y);
      });
    };

    var cEnsurePositionChanged = Chain.control(
      Chain.binder(function (all) {
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
    var cEnsurePinned = Chain.control(
      Chain.binder(function (all) {
        var pinned = all.box_position4.top !== all.box_position5_pinned.top &&
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

    var cRecordPosition = Chain.fromChains([
      Chain.control(
        Chain.binder(function (box) {
          return Css.getRaw(box, 'left').bind(function (left) {
            return Css.getRaw(box, 'top').map(function (top) {
              return Result.value({
                left: left,
                top: top
              });
            });
          }).getOrThunk(function () {
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
          NamedChain.direct('box', cMousedown, '_'),
          NamedChain.writeValue('container', gui.element()),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.direct('blocker', cMousemoveTo(100, 200), '_'),
          NamedChain.direct('blocker', cMousemoveTo(120, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),

          NamedChain.direct('blocker', cMousemoveTo(140, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.direct('blocker', cMousemoveTo(160, 200), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position3'),
          NamedChain.write('_', cEnsurePositionChanged),

          NamedChain.direct('blocker', cMouseup, '_'),
          NamedChain.direct('container', Chain.control(
            UiFinder.cFindIn('.test-blocker'),
            Guard.tryUntilNot('There should no longer be a blocker', 100, 100)
          ), 'blocker'),

          // When testing pinning, we need every browser to behave identically, so we reset positions
          // so we know what we are dealing with
          NamedChain.direct('box', Chain.op(function (elem) {
            Css.setAll(elem, {
              'left': '50px',
              top: '100px'
            });
          }), '_'),

          NamedChain.direct('box', cMousedown, '_'),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          // Test pinning.
          NamedChain.direct('blocker', cMousemoveTo(50, 100), '_'),
          NamedChain.direct('blocker', cMousemoveTo(50, 100), '_'),
          NamedChain.direct('blocker', cMousemoveTo(50, 60), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position4'),
          NamedChain.direct('blocker', cMousemoveTo(50, 30), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position5_pinned'),
          NamedChain.direct('blocker', cMousemoveTo(160, 20), '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position6_pinned'),
          NamedChain.write('_', cEnsurePinned),

          Chain.wait(10),
          NamedChain.bundle(function (output) {
            return Result.value(output);
          })
        ])
      ])
    ];
  }, function () { success(); }, failure);
});

