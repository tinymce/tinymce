import { Assertions, Chain, Mouse, NamedChain3 as NC, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Css, Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Dragging } from 'ephox/alloy/api/behaviour/Dragging';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('MouseDragEventTest', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
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
            repositionTarget: false,
            blockerClass: 'test-blocker',
            onDrag: (_comp, _targetElem, delta) => {
              store.adder({ left: delta.left(), top: delta.top() })();
            }
          })
        ])
      })
    );
  }, (doc, body, gui, component, store) => {
    const cAssertNoPositionInfo = Chain.op((box: Element) => {
      Assertions.assertEq('Should be no "left"', true, Css.getRaw(box, 'left').isNone());
      Assertions.assertEq('Should be no "top"', true, Css.getRaw(box, 'top').isNone());
    });

    type MDT  = { box: Element; container: Element; blocker: Element; };

    return [
      Chain.asStep({}, [
        NC.asEffectChain<MDT>()([
          NC.inject(component.element(), 'box'),
          NC.inject(gui.element(), 'container'),
          store.cClear,
          NC.read('box', Mouse.cMouseDown),
          NC.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NC.read('blocker', Mouse.cMouseMoveTo(100, 200)),
          store.cAssertEq('Checking that no drag events have fired yet', [ ]),
          NC.read('blocker', Mouse.cMouseMoveTo(120, 200)),
          store.cAssertEq('Checking that a drag event has fired with (20, 0) delta', [ { left: 20, top: 0 } ]),
          NC.read('box', cAssertNoPositionInfo),
          NC.read('blocker', Mouse.cMouseUp),
          store.cClear,

          NC.read('box', Mouse.cMouseDown),
          NC.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),
          NC.read('blocker', Mouse.cMouseMoveTo(300, 100)),
          store.cAssertEq('The state should have been reset, so one position should not give us a delta', [ ]),
          NC.read('blocker', Mouse.cMouseMoveTo(303, 100)),
          store.cAssertEq('The state should have been reset, so two positions should give us a delta of (3, 0)', [ { left: 3, top: 0 } ]),
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
