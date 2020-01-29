import { Assertions, Chain, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Css } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as Layout from 'ephox/alloy/positioning/layout/Layout';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('HotspotPositionTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const hotspot = GuiFactory.build(
      Button.sketch({
        action () { },
        dom: {
          styles: {
            position: 'absolute',
            left: '100px',
            top: '200px'
          },
          innerHtml: 'Hotspot',
          tag: 'button'
        },
        uid: 'hotspot'
      })
    );

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(hotspot)
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    const cSetupAnchor = Chain.mapper((hotspot) => {
      return {
        anchor: 'hotspot',
        hotspot,
        layouts: {
          onLtr: () => [ Layout.northeast, Layout.southeast ],
          onRtl: () => [ Layout.northwest, Layout.southwest ]
        }
      };
    });

    const cAssertLayoutDirection = (direction: 'top' | 'bottom'): Chain<any, any> => Chain.op((data: { popup: AlloyComponent }) => {
      const popup = data.popup.element();
      // Swap the direction name, as the style used is opposite
      const style = direction === 'top' ? 'bottom' : 'top';
      Assertions.assertEq(`Assert layout direction is ${direction}`, true, Css.getRaw(popup, style).isSome());
    });

    const win = Boxes.win();
    const bounds100PixelsFromTop = Boxes.bounds(win.x(), win.y() + 100, win.width(), win.height() - 100);

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          ChainUtils.cFindUids(gui, {
            fixed: 'fixed-sink',
            relative: 'relative-sink',
            popup: 'popup',
            hotspot: 'hotspot'
          }),

          NamedChain.direct('hotspot', cSetupAnchor, 'anchor'),

          PositionTestUtils.cTestSinkWithinBounds('Relative, not scrolled', 'relative', win),
          cAssertLayoutDirection('top'),
          PositionTestUtils.cTestSinkWithinBounds('Fixed, not scrolled', 'fixed', win),
          cAssertLayoutDirection('top'),

          PositionTestUtils.cTestSinkWithinBounds('Relative, bounds 50px from top', 'relative', bounds100PixelsFromTop),
          cAssertLayoutDirection('bottom'),
          PositionTestUtils.cTestSinkWithinBounds('Fixed, bounds 50px from top', 'fixed', bounds100PixelsFromTop),
          cAssertLayoutDirection('bottom'),
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
