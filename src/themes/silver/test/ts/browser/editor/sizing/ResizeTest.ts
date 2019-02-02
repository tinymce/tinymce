import { Assertions, Chain, Guard, NamedChain, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('Editor resize test', (success, failure) => {
  Theme();

  const enum BoxSizing {
    BorderBox = 'border-box',
    ContentBox = 'content-box'
  }

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const cAssertEditorSize = (expectedWidth: number, expectedHeight: number) => {
      return Chain.control(
        Chain.op((container: Element) => {
          Assertions.assertEq(`Editor should be ${expectedHeight}px high`, expectedHeight, container.dom().offsetHeight);
          Assertions.assertEq(`Editor should be ${expectedWidth}px wide`, expectedWidth, container.dom().offsetWidth);
        }),
        Guard.addLogging('Ensure that the editor has resized')
      );
    };

    const cResizeToPos = (sx: number, sy: number, dx: number, dy: number, delta: number = 10) => {
      // Simulate moving the mouse, by making a number of movements
      const numMoves = sy === dy ? Math.abs(dx - sx) / delta : Math.abs(dy - sy) / delta;
      // Determine the deltas based on the number of moves to make
      const deltaX = (dx - sx) / numMoves;
      const deltaY = (dy - sy) / numMoves;
      // Move and release the mouse
      return Chain.control(
        Chain.fromChains([
            UiFinder.cFindIn('.tox-blocker'),
            Mouse.cMouseMoveTo(sx, sy)
          ].concat(
            Arr.range(numMoves, (count) => {
              const nx = sx + count * deltaX;
              const ny = sy + count * deltaY;
              return Mouse.cMouseMoveTo(nx, ny);
            })
          ).concat([
            Mouse.cMouseMoveTo(dx, dy),
            Mouse.cMouseUp
          ])
        ),
        Guard.addLogging(`Resizing from (${sx}, ${sy}) to (${dx}, ${dy})`)
      );
    };

    const sTestResize = (boxSizing: BoxSizing) => {
      return Chain.asStep(Body.body(), [
        Chain.op(() => {
          editor.dom.setStyles(editor.getContainer(), {
            'box-sizing': boxSizing,
            'border': '2px solid #ccc',
            'height': boxSizing === BoxSizing.BorderBox ? '400px' : '396px',
            'width': boxSizing === BoxSizing.BorderBox ? '400px' : '396px'
          });
        }),
        Chain.label(`Test resize with ${boxSizing} sizing`, NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
          NamedChain.writeValue('container', Element.fromDom(editor.getContainer())),
          NamedChain.direct('body', UiFinder.cFindIn('.tox-statusbar__resize-handle'), 'resizeHandle'),

          // Shrink to 300px
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(400, 400, 300, 300), '_'),
          NamedChain.direct('container', cAssertEditorSize(300, 300), '_'),

          // Enlarge to 450px
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(300, 300, 450, 450), '_'),
          NamedChain.direct('container', cAssertEditorSize(450, 450), '_'),

          // Try to shrink to below min height
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(450, 450, 450, 250), '_'),
          NamedChain.direct('container', cAssertEditorSize(450, 300), '_'),

          // Try to enlarge to above max height
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(450, 300, 450, 550), '_'),
          NamedChain.direct('container', cAssertEditorSize(450, 500), '_'),

          // Try to shrink to below min width
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(450, 500, 250, 500), '_'),
          NamedChain.direct('container', cAssertEditorSize(300, 500), '_'),

          // Try to enlarge to above max width
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(300, 500, 550, 500), '_'),
          NamedChain.direct('container', cAssertEditorSize(500, 500), '_'),
        ]))
      ]);
    };

    Pipeline.async({ }, [
      sTestResize(BoxSizing.BorderBox),
      sTestResize(BoxSizing.ContentBox)
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/js/tinymce',
    resize: 'both',
    min_height: 300,
    min_width: 300,
    max_height: 500,
    max_width: 500
  }, success, failure);
});