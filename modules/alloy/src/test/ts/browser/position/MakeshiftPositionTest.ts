import { Assertions, Chain, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('MakeshiftPositionTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {
    const button = GuiFactory.build(
      Button.sketch({
        action: Fun.noop,
        dom: {
          styles: {
            position: 'absolute',
            left: '100px',
            top: '120px'
          },
          innerHtml: 'Button',
          tag: 'button'
        },
        uid: 'button'
      })
    );

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(button)
        ]
      })
    );

  }, (_doc, _body, gui, _component, _store) => {
    const cSetupAnchor = (x: number, y: number) => Chain.injectThunked(() => ({
      type: 'makeshift',
      x,
      y
    }));

    const cAssertPopupNotInNoFitPosition = Chain.op((popup: AlloyComponent) => {
      const box = popup.element.dom.getBoundingClientRect();
      Assertions.assertEq('Assert not attached to the bottom of the viewport (eg nofit)', true, box.bottom !== window.innerHeight);
    });

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          ChainUtils.cFindUids(gui, {
            fixed: 'fixed-sink',
            relative: 'relative-sink',
            popup: 'popup',
            button: 'button'
          }),
          NamedChain.write('anchor', cSetupAnchor(100, 100)),

          PositionTestUtils.cTestSink('Relative, not scrolled', 'relative'),
          PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),

          PositionTestUtils.cScrollDown('button', '2000px'),
          NamedChain.write('anchor', cSetupAnchor(100, 2100)),
          PositionTestUtils.cTestSink('Relative, scrolled 2000px', 'relative'),
          PositionTestUtils.cTestSink('Fixed, scrolled 2000px', 'fixed'),
          NamedChain.direct('popup', cAssertPopupNotInNoFitPosition, '_')
        ])
      ])
    ];
  }, success, failure);
});
