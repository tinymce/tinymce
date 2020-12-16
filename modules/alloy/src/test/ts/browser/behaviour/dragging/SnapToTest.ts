import { Chain, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, Scroll, SugarPosition } from '@ephox/sugar';

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
    range: SugarPosition(10, 10),
    output: DragCoord.fixed(Optional.some(300), Optional.some(10))
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
            getSnapPoints: () => [
              snap
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
  ), (_doc, _body, _gui, component, _store) => {

    const cSubject = Chain.injectThunked(() => subject.get(component).element);

    const cRecordPosition = Chain.fromChains([
      Chain.control(
        Chain.binder((box) => Css.getRaw(box, 'left').bind((left) => Css.getRaw(box, 'top').map((top) => Result.value({
          left,
          top
        }))).getOrThunk(() => Result.error('No left,top information yet'))),
        Guard.tryUntil('Waiting for position data to record')
      )
    ]);

    const cEnsurePositionChanged = Chain.control(
      Chain.binder((all: any) => all.box_position1.left !== all.box_position2.left ? Result.value({}) :
        Result.error('Positions did not change.\nSugarPosition data: ' + JSON.stringify({
          1: all.box_position1,
          2: all.box_position2
        }, null, 2))),
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
          NamedChain.bundle((output) => Result.value(output))
        ])
      ])
    ];
  }, success, failure);
});
