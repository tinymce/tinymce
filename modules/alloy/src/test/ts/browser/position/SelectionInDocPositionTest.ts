import { Chain, Cursors, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Option, Result } from '@ephox/katamari';
import { Css, Element, Html } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('SelectionInDocPositionTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {
    let content = '';
    for (let i = 0; i < 20; i++) {
      content += '<p>paragraph ' + i + '</p>';
    }

    const editor = Element.fromTag('div');
    Html.set(editor, content);

    const inlineEditor = GuiFactory.build(
      GuiFactory.external({
        uid: 'inline-editor',
        element: editor
      })
    );

    Css.setAll(inlineEditor.element(), {
      'margin-top': '300px',
      'height': '200px',
      'overflow': 'scroll',
      'border': '1px solid red'
    });

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(inlineEditor)
        ]
      })
    );

  }, (_doc, _body, gui, _component, _store) => {
    const cSetupAnchor = Chain.mapper((data: any) => ({
      anchor: 'selection',
      root: data.inline.element(),
      getSelection() {
        return Option.some(
          Cursors.calculate(data.inline.element(), data.path)
        );
      }
    }));

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          ChainUtils.cFindUids(gui, {
            fixed: 'fixed-sink',
            relative: 'relative-sink',
            popup: 'popup',
            inline: 'inline-editor'
          }),

          ChainUtils.cLogging(
            'Setting selection path to 3rd paragraph',
            [
              NamedChain.writeValue('path', Cursors.path({
                startPath: [ 2 ],
                soffset: 0,
                finishPath: [ 3 ],
                foffset: 0
              }))
            ]
          ),

          NamedChain.write('anchor', cSetupAnchor),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll',
            'fixed'
          ),

          PositionTestUtils.cScrollDown(
            'inline',
            '2000px'
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 3rd paragraph, large scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 3rd paragraph, large scroll, no editor scroll',
            'fixed'
          ),

          ChainUtils.cLogging(
            'Setting selection to 13th paragraph and scrolling there',
            [
              NamedChain.writeValue('path', Cursors.path({
                startPath: [ 12 ],
                soffset: 0,
                finishPath: [ 13 ],
                foffset: 0
              })),
              NamedChain.bundle((data: any) => {
                const root = data.inline.element();
                const path = data.path;
                const range = Cursors.calculate(root, path);
                range.start().dom().scrollIntoView();
                return Result.value(data);
              }),

              // Update the anchor
              NamedChain.write('anchor', cSetupAnchor)
            ]
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 13rd paragraph, large scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 13rd paragraph, large scroll, no editor scroll',
            'fixed'
          )
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
