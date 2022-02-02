import { Chain, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('HotspotPositionTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {
    const hotspot = GuiFactory.build(
      Button.sketch({
        action: Fun.noop,
        dom: {
          styles: {
            position: 'absolute',
            left: '100px',
            top: '120px'
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

  }, (_doc, _body, gui, _component, _store) => {
    const cSetupAnchor = Chain.mapper((hotspot) => ({
      type: 'hotspot',
      hotspot
    }));

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

          PositionTestUtils.cTestSink('Relative, not scrolled', 'relative'),
          PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),

          PositionTestUtils.cScrollDown('hotspot', '1000px'),
          PositionTestUtils.cTestSink('Relative, scrolled 1000px', 'relative'),
          PositionTestUtils.cTestSink('Fixed, scrolled 1000px', 'fixed')
        ])
      ])
    ];
  }, success, failure);
});
