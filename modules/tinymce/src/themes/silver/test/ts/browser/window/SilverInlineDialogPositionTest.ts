import { Assertions, Chain, Guard, NamedChain, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Types } from '@ephox/bridge';
import { document, HTMLElement } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Css, Element, Height, Scroll, Traverse, Width } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';
import * as DialogUtils from '../../module/DialogUtils';
import { cResizeToPos } from '../../module/UiChainUtils';

UnitTest.asynctest('WindowManager:inline-dialog Position Test', (success, failure) => {
  Theme();

  const dialogSpec: Types.Dialog.DialogApi<{}> = {
    title: 'Silver Test Inline (Toolbar) Dialog',
    body: {
      type: 'panel',
      items: []
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      }
    ],
    initialData: {}
  };

  const cAssertPos = (pos: string, x: number, y: number, diff: number = 5) => Chain.control(
    Chain.op((dialog: Element<HTMLElement>) => {
      const position = Css.get(dialog, 'position');
      const top = parseInt(Css.get(dialog, 'top').replace('px', ''), 10);
      // Note: We can't use Css.get(dialog, 'left') here as IE returns 'auto' for the computed value,
      // so instead calculate the left pos based on the right pos
      const left = document.documentElement.clientWidth - Width.get(dialog) - parseInt(Css.get(dialog, 'right').replace('px', ''), 10);
      Assertions.assertEq(`Dialog position (${position}) should be ${pos}`, pos, position);
      Assertions.assertEq(`Dialog top position (${top}px) should be ~${y}px`, true, Math.abs(top - y) < diff);
      Assertions.assertEq(`Dialog left position (${left}px) should be ~${x}px`, true, Math.abs(left - x) < diff);
    }),
    Guard.tryUntil('Wait for dialog position to update')
  );

  const cScrollTo = (x: number, y: number) => Chain.control(
    Chain.op(() => Scroll.to(x, y)),
    Guard.addLogging(`Scrolling to (${x}, ${y})`)
  );

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const cTestOpen = Chain.fromChains([
      DialogUtils.cOpen(editor, dialogSpec, { inline: 'toolbar'}),
      Chain.mapper(() => {
        const dialog = UiFinder.findIn(Body.body(), '.tox-dialog-inline').getOrDie();
        return Traverse.parent(dialog).getOr(dialog);
      })
    ]);

    Pipeline.async({ }, [
      Chain.asStep(Body.body(), [
        Chain.label('Test position when resizing', NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
          NamedChain.writeValue('container', Element.fromDom(editor.getContainer())),
          NamedChain.direct('body', UiFinder.cFindIn('.tox-statusbar__resize-handle'), 'resizeHandle'),
          NamedChain.direct('body', cTestOpen, 'dialog'),
          NamedChain.direct('dialog', cAssertPos('absolute', 105, -310), '_'),

          // Shrink the editor to 300px
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(600, 400, 500, 300), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 5, -171), '_'), // Toolbar wraps so y diff is 100 + toolbar height

          // Enlarge the editor to 500px
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(500, 300, 700, 500), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 205, -410), '_'),

          // Resize back to the original size
          NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
          NamedChain.direct('body', cResizeToPos(700, 500, 600, 400), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 105, -310), '_'),

          NamedChain.direct('body', DialogUtils.cClose, '_'),
          NamedChain.outputInput
        ])),
        Chain.label('Test position when scrolling', NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
          NamedChain.writeValue('container', Element.fromDom(editor.getContainer())),
          NamedChain.direct('body', cTestOpen, 'dialog'),

          // Enlarge the editor to 2000px
          NamedChain.direct('container', Chain.op((container) => {
            Height.set(container, 2000);
            editor.fire('ResizeEditor');
          }), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 105, -1910), '_'),

          // Scroll to 1500px and assert docked
          NamedChain.direct('body', cScrollTo(0, 1500), '_'),
          NamedChain.direct('dialog', cAssertPos('fixed', 105, 0), '_'),

          // Scroll back to top and assert not docked
          NamedChain.direct('body', cScrollTo(0, 0), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 105, -1910), '_'),

          NamedChain.direct('body', DialogUtils.cClose, '_'),
          NamedChain.outputInput
        ])),
        Chain.label('Test initial position when initially scrolled', NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
          NamedChain.writeValue('container', Element.fromDom(editor.getContainer())),

          // Enlarge the editor to 2000px
          NamedChain.direct('container', Chain.op((container) => {
            Height.set(container, 2000);
            editor.fire('ResizeEditor');
          }), '_'),

          // Scroll to 1500px, open the dialog and assert docked
          NamedChain.direct('body', cScrollTo(0, 1500), '_'),
          NamedChain.direct('body', cTestOpen, 'dialog'),
          NamedChain.direct('dialog', cAssertPos('fixed', 105, 0), '_'),

          // Scroll back to top and assert not docked
          NamedChain.direct('body', cScrollTo(0, 0), '_'),
          NamedChain.direct('dialog', cAssertPos('absolute', 105, -1910), '_'),

          NamedChain.direct('body', DialogUtils.cClose, '_'),
          NamedChain.outputInput
        ]))
      ])
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    resize: 'both',
    height: 400,
    width: 600,
    toolbar_sticky: false
  }, success, failure);
});
