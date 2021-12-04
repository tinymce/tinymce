import { Chain, Cursors, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, Html, Scroll, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import { toDomRange } from 'ephox/alloy/test/RangeUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('SelectionInDocPositionTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {
    let content = '';
    for (let i = 0; i < 20; i++) {
      content += '<p>paragraph ' + i + '</p>';
    }

    const editor = SugarElement.fromTag('div');
    Html.set(editor, content);

    const inlineEditor = GuiFactory.build(
      GuiFactory.external({
        uid: 'inline-editor',
        element: editor
      })
    );

    Css.setAll(inlineEditor.element, {
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
      type: 'selection',
      root: data.inline.element,
      getSelection: () => {
        return Optional.some(
          Cursors.calculate(data.inline.element, data.path)
        );
      }
    }));

    const cAssertBelowSelection = NamedChain.bundle((data: any) => {
      const root = data.inline.element;
      const popup = data.popup;
      const path = data.path;
      const range = toDomRange(Cursors.calculate(root, path));

      const selectionBox = range.getBoundingClientRect();
      const popupBox = popup.element.dom.getBoundingClientRect();
      assert.isAtLeast(popupBox.top, selectionBox.bottom);
      assert.approximately(popupBox.top, selectionBox.bottom, 5);
      return Result.value(data);
    });

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
                const root = data.inline.element;
                const path = data.path;
                const range = Cursors.calculate(root, path);
                (range.start as SugarElement<Element>).dom.scrollIntoView();
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
          ),

          ChainUtils.cLogging(
            'Setting selection to 5th-7th paragraph and scrolling there',
            [
              NamedChain.writeValue('path', Cursors.path({
                startPath: [ 5 ],
                soffset: 0,
                finishPath: [ 7 ],
                foffset: 1
              })),
              NamedChain.bundle((data: any) => {
                const root = data.inline.element;
                // Scroll so the 7th paragraph is at the top
                const range = Cursors.calculate(root, Cursors.path({
                  startPath: [ 7 ],
                  soffset: 0,
                  finishPath: [ 7 ],
                  foffset: 1
                }));
                Scroll.intoView(range.start as SugarElement<Element>, true);
                return Result.value(data);
              }),

              // Update the anchor
              NamedChain.write('anchor', cSetupAnchor)
            ]
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 5th-7th paragraph, no scroll, some editor scroll',
            'relative'
          ),
          ChainUtils.cLogging(
            'Relative, Selected: 5th-7th paragraph, assert below selection',
            [ cAssertBelowSelection ]
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 5th-7th paragraph, no scroll, some editor scroll',
            'fixed'
          ),
          ChainUtils.cLogging(
            'Fixed, Selected: 5th-7th paragraph, assert below selection',
            [ cAssertBelowSelection ]
          )
        ])
      ])
    ];
  }, success, failure);
});
