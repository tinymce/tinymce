import { Chain, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('SubmenuPositionTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const item = GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'li',
          innerHtml: 'Trigger Item'
        },

        uid: 'test-item'
      })
    );

    const list = GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'ol',
          styles: {
            position: 'absolute',
            left: '400px',
            top: '140px'
          }
        },
        uid: 'test-list',
        components: [
          GuiFactory.premade(item)
        ]
      })
    );

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(list)
        ]
      })
    );

  }, (doc, body, gui, component, store) => {
    const cSetupAnchor = Chain.mapper((item) => {
      return {
        anchor: 'submenu',
        item
      };
    });

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          ChainUtils.cFindUids(gui, {
            fixed: 'fixed-sink',
            relative: 'relative-sink',
            popup: 'popup',
            item: 'test-item',
            list: 'test-list'
          }),

          NamedChain.direct('item', cSetupAnchor, 'anchor'),

          PositionTestUtils.cTestSink('Relative, not scrolled', 'relative'),
          PositionTestUtils.cTestSink('Fixed, not scrolled', 'fixed'),

          PositionTestUtils.cScrollDown('list', '1000px'),
          PositionTestUtils.cTestSink('Relative, scrolled 1000px', 'relative'),
          PositionTestUtils.cTestSink('Fixed, scrolled 1000px', 'fixed')
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
