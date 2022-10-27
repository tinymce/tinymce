import { Chain, Cursors, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, DomEvent, Scroll, SelectorFind, SimRange, SugarElement, SugarNode, SugarPosition, Traverse, WindowSelection } from '@ephox/sugar';
import { assert } from 'chai';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import { toDomRange } from 'ephox/alloy/test/RangeUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

import * as Frames from '../../../../demo/ts/ephox/alloy/demo/frames/Frames';

UnitTest.asynctest('SelectionInFramePositionTest', (success, failure) => {

  const frame = SugarElement.fromTag('iframe');

  GuiSetup.setup((_store, _doc, _body) => {
    let content = '';
    for (let i = 0; i < 20; i++) {
      content += '<p>paragraph ' + i + '</p>';
    }

    const onload = DomEvent.bind(frame, 'load', () => {
      onload.unbind();
      Frames.write(frame, '<html><body contenteditable="true">' + content + '</body></html>');
    });

    const classicEditor = GuiFactory.build(
      GuiFactory.external({
        uid: 'classic-editor',
        element: frame
      })
    );

    Css.set(classicEditor.element, 'margin-top', '300px');

    return GuiFactory.build(
      Container.sketch({
        components: [
          GuiFactory.premade(Sinks.fixedSink()),
          GuiFactory.premade(Sinks.relativeSink()),
          GuiFactory.premade(Sinks.popup()),
          GuiFactory.premade(classicEditor)
        ]
      })
    );

  }, (_doc, _body, gui, _component, _store) => {
    const cSetupAnchor = Chain.mapper((data: any) => ({
      type: 'selection',
      root: SugarElement.fromDom(data.classic.element.dom.contentWindow.document.body)
    }));

    const cGetWin = Chain.mapper((frame: any) => frame.element.dom.contentWindow);

    const cSetPath = (rawPath: { startPath: number[]; soffset: number; finishPath: number[]; foffset: number }) => {
      const path = Cursors.path(rawPath);

      return Chain.binder((win: Window) => {
        const body = SugarElement.fromDom(win.document.body);
        const range = Cursors.calculate(body, path);
        WindowSelection.setExact(
          win,
          range.start,
          range.soffset,
          range.finish,
          range.foffset
        );
        return WindowSelection.getExact(win).fold(() => Result.error<SimRange, string>('Could not retrieve the set selection'), Result.value);
      });
    };

    const cAssertBelowSelection = (pathLabel: string) => NamedChain.bundle((data: any) => {
      const frame = data.classic.element;
      const root = SugarElement.fromDom(frame.dom.contentWindow.document.body);
      const popup = data.popup;
      const path = data[pathLabel];
      const range = toDomRange(Cursors.calculate(root, path));

      const frameRect = frame.dom.getBoundingClientRect();
      const selectionBox = range.getBoundingClientRect();
      const popupBox = popup.element.dom.getBoundingClientRect();
      assert.isAtLeast(popupBox.top, selectionBox.bottom + frameRect.top);
      assert.approximately(popupBox.top, selectionBox.bottom + frameRect.top, 5);
      return Result.value(data);
    });

    const cScrollIntoView = (rangeLabel: string, scrollLabel: string, errorMessage: string): NamedChain => {
      return NamedChain.direct(rangeLabel, Chain.binder((range: SimRange): Result<SugarPosition, string> => {
        const start = range.start;
        // NOTE: Safari likes to select the text node.
        const optElement = SugarNode.isText(start) ? Traverse.parentNode(start) : Optional.some(start);
        return optElement.filter(SugarNode.isHTMLElement).map((elem) => {
          Scroll.intoView(elem, true);
          return Scroll.get(Traverse.owner(elem));
        }).fold(() => Result.error(errorMessage), Result.value);
      }), scrollLabel);
    };

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          ChainUtils.cFindUids(gui, {
            fixed: 'fixed-sink',
            relative: 'relative-sink',
            popup: 'popup',
            classic: 'classic-editor'
          }),
          NamedChain.direct('classic', cGetWin, 'iWin'),

          // Wait until the content has loaded
          ChainUtils.cLogging(
            'Waiting for iframe to load content.',
            [
              Chain.control(
                Chain.binder((data: any) => {
                  const root = SugarElement.fromDom(data.classic.element.dom.contentWindow.document.body);
                  return SelectorFind.descendant(root, 'p').fold(() => Result.error('Could not find paragraph yet'), (_p) => Result.value(data));
                }),
                Guard.tryUntil('Waiting for content to load in iframe', 10, 10000)
              )
            ]
          ),

          ChainUtils.cLogging(
            'Selecting 3rd paragraph',
            [
              NamedChain.direct('iWin', cSetPath({
                startPath: [ 2, 0 ],
                soffset: 0,
                finishPath: [ 3, 0 ],
                foffset: 0
              }), 'range'),
              NamedChain.write('anchor', cSetupAnchor)
            ]
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSinkWithinBounds(
            'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll, positioned within frame',
            'relative',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cTestSink(
            'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll',
            'fixed'
          ),
          PositionTestUtils.cTestSinkWithinBounds(
            'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll, positioned within frame',
            'fixed',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cScrollDown('classic', '2000px'),
          PositionTestUtils.cTestSink(
            'Relative, Selected: 3rd paragraph, 2000px scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSinkWithinBounds(
            'Relative, Selected: 3rd paragraph, 2000px scroll, no editor scroll, positioned within frame',
            'relative',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cTestSink(
            'Fixed, Selected: 3rd paragraph, 2000px scroll, no editor scroll',
            'fixed'
          ),
          PositionTestUtils.cTestSinkWithinBounds(
            'Fixed, Selected: 3rd paragraph, 2000px scroll, no editor scroll, positioned within frame',
            'fixed',
            () => Boxes.box(frame)
          ),

          ChainUtils.cLogging(
            'Selecting 13th paragraph and scrolling to it',
            [
              NamedChain.direct('iWin', cSetPath({
                startPath: [ 12 ],
                soffset: 0,
                finishPath: [ 13 ],
                foffset: 0
              }), 'range2'),
              cScrollIntoView('range2', 'scroll2', 'Could not scroll to 13th paragraph'),
              NamedChain.write('anchor', cSetupAnchor)
            ]
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 13rd paragraph, 2000px scroll, no editor scroll',
            'relative'
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 13rd paragraph, 2000px scroll, no editor scroll',
            'fixed'
          ),

          ChainUtils.cLogging(
            'Setting selection to 5th-7th paragraph and scrolling there',
            [
              NamedChain.writeValue('path3', Cursors.path({
                startPath: [ 5 ],
                soffset: 0,
                finishPath: [ 7 ],
                foffset: 1
              })),
              NamedChain.direct('iWin', cSetPath({
                startPath: [ 5 ],
                soffset: 0,
                finishPath: [ 7 ],
                foffset: 1
              }), 'range3'),
              cScrollIntoView('range3', 'scroll3', 'Could not scroll to 5th-7th paragraph selection'),
              NamedChain.write('anchor', cSetupAnchor)
            ]
          ),

          PositionTestUtils.cTestSink(
            'Relative, Selected: 5th-7th paragraph, no scroll, some editor scroll',
            'relative'
          ),
          ChainUtils.cLogging(
            'Relative, Selected: 5th-7th paragraph, assert below selection',
            [ cAssertBelowSelection('path3') ]
          ),
          PositionTestUtils.cTestSink(
            'Fixed, Selected: 5th-7th paragraph, no scroll, some editor scroll',
            'fixed'
          ),
          ChainUtils.cLogging(
            'Fixed, Selected: 5th-7th paragraph, assert below selection',
            [ cAssertBelowSelection('path3') ]
          )
        ])
      ])
    ];
  }, success, failure);
});
