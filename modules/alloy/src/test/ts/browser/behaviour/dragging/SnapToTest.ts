import { Chain, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option, Result } from '@ephox/katamari';
import { Css, Position, Scroll } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as DragCoord from 'ephox/alloy/api/data/DragCoord';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('SnapToTest', (success, failure) => {

  const snap = Dragging.snap({
    sensor: DragCoord.fixed(300, 10),
    range: Position(10, 10),
    output: DragCoord.fixed(Option.some(300), Option.some(10))
  });

  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          'box-sizing': 'border-box',
          'width': '100px',
          'height': '100px',
          'border': '1px solid green',
          'left': '100px',
          'top': '100px'
        }
      },
      containerBehaviours: Behaviour.derive([
        Dragging.config({
          mode: 'mouse',
          blockerClass: 'test-blocker',
          snaps: {
            getSnapPoints () {
              return [
                snap
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

    const cEnsurePositionChanged = Chain.control(
      Chain.binder((all: any) => {
        return all.box_position1.left !== all.box_position2.left ? Result.value({}) :
          Result.error('Positions did not change.\nPosition data: ' + JSON.stringify({
            1: all.box_position1,
            2: all.box_position2
          }, null, 2));
      }),
      Guard.addLogging('Ensuring that the position information read from the different stages was different')
    );

    const cSnapTo = Chain.op(() => {
      Dragging.snapTo(subject.get(component), snap);
    });

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.write('box', cSubject),
          NamedChain.direct('box', cRecordPosition, 'box_position1'),
          NamedChain.direct('box', cSnapTo, '_'),
          NamedChain.direct('box', cRecordPosition, 'box_position2'),
          NamedChain.write('_', cEnsurePositionChanged),
          NamedChain.bundle((output) => {
            return Result.value(output);
          })
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
