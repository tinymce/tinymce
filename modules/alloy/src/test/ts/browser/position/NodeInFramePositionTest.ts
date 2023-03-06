import { Chain, Cursors, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from '@ephox/katamari';
import { Css, DomEvent, SelectorFind, SimRange, SugarElement, WindowSelection } from '@ephox/sugar';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as PositionTestUtils from 'ephox/alloy/test/PositionTestUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

import * as Frames from '../../../../demo/ts/ephox/alloy/demo/frames/Frames';

UnitTest.asynctest('SelectionInFramePositionTest', (success, failure) => {

  const frame = SugarElement.fromTag('iframe');

  GuiSetup.setup((_store, _doc, _body) => {
    let content = '';
    for (let i = 0; i < 20; i++) {
      content += '<p id=p' + i + '>paragraph ' + i + '</p>';
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
    const cSetupAnchor = Chain.mapper((data: any) => {
      const node = data.classic.element.dom.contentWindow.document.querySelector('#p3');
      return {
        type: 'node',
        root: SugarElement.fromDom(data.classic.element.dom.contentWindow.document.body),
        node: Optional.some(SugarElement.fromDom(node))
      };
    });

    const cGetWin = Chain.mapper((frame: AlloyComponent) => frame.element.dom.contentWindow);

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

          PositionTestUtils.cTestSinkWithinBounds(
            'Relative, Selected: 3rd paragraph, no page scroll, no editor scroll, positioned within frame',
            'relative',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cTestSinkWithinBounds(
            'Fixed, Selected: 3rd paragraph, no page scroll, no editor scroll, positioned within frame',
            'fixed',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cScrollDown('classic', '2000px'),

          PositionTestUtils.cTestSinkWithinBounds(
            'Relative, Selected: 3rd paragraph, 2000px scroll, no editor scroll, positioned within frame',
            'relative',
            () => Boxes.box(frame)
          ),

          PositionTestUtils.cTestSinkWithinBounds(
            'Fixed, Selected: 3rd paragraph, 2000px scroll, no editor scroll, positioned within frame',
            'fixed',
            () => Boxes.box(frame)
          )
        ])
      ])
    ];
  }, success, failure);
});
