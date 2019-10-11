import { Assertions, Chain, Mouse, NamedChain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
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

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          store.cClear,
          NamedChain.writeValue('box', component.element()),
          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.writeValue('container', gui.element()),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

          NamedChain.direct('blocker', Mouse.cMouseMoveTo(100, 200), '_'),
          store.cAssertEq('Checking that no drag events have fired yet', [ ]),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(120, 200), '_'),
          store.cAssertEq('Checking that a drag event has fired with (20, 0) delta', [ { left: 20, top: 0 } ]),
          NamedChain.direct('box', cAssertNoPositionInfo, '_'),
          NamedChain.direct('blocker', Mouse.cMouseUp, '_'),
          store.cClear,

          NamedChain.direct('box', Mouse.cMouseDown, '_'),
          NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(300, 100), '_'),
          store.cAssertEq('The state should have been reset, so one position should not give us a delta', [ ]),
          NamedChain.direct('blocker', Mouse.cMouseMoveTo(303, 100), '_'),
          store.cAssertEq('The state should have been reset, so two positions should give us a delta of (3, 0)', [ { left: 3, top: 0 } ]),
          NamedChain.bundle((output) => {
            return Result.value(output);
          })
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
