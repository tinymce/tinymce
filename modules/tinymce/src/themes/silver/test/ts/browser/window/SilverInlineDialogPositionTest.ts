import { Assertions, Chain, Guard, Mouse, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Types } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Editor as McEditor } from '@ephox/mcagar';
import { Body, Css, Element, Height, Scroll, Traverse } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import Theme from 'tinymce/themes/silver/Theme';
import * as DialogUtils from '../../module/DialogUtils';
import { cResizeToPos, cScrollRelativeEditor } from '../../module/UiChainUtils';
import { setupPageScroll } from '../../module/Utils';

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

  const cAssertPos = (pos: string, x: number, y: number) => Chain.control(
    Chain.op((dialog: Element<HTMLElement>) => {
      const diff = 5;
      const position = Css.get(dialog, 'position');
      const top = dialog.dom().offsetTop;
      const left = dialog.dom().offsetLeft;
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

  const createTestOpenChain = (editor: Editor) => Chain.fromChains([
    DialogUtils.cOpen(editor, dialogSpec, { inline: 'toolbar'}),
    Chain.injectThunked(() => {
      const dialog = UiFinder.findIn(Body.body(), '.tox-dialog-inline').getOrDie();
      return Traverse.parent(dialog).getOr(dialog);
    })
  ]);

  const sToolbarTopStep = Chain.asStep({}, [
    McEditor.cFromSettings({
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      resize: 'both',
      height: 400,
      width: 600,
      toolbar_sticky: false
    }),
    Chain.async((editor: Editor, onSuccess, onFailure) => {
      const cTestOpen = createTestOpenChain(editor);

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
      ], () => onSuccess(editor), onFailure);
    }),
    McEditor.cRemove
  ]);

  const sToolbarBottomStep = Chain.asStep({}, [
    McEditor.cFromSettings({
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      height: 400,
      width: 600,
      toolbar_sticky: true,
      toolbar_location: 'bottom'
    }),
    Chain.async((editor: Editor, onSuccess, onFailure) => {
      const cTestOpen = createTestOpenChain(editor);
      const teardownPageScroll = setupPageScroll(editor, 1000);

      Pipeline.async({ }, [
        Chain.asStep(Body.body(), [
          Chain.label('Position of dialog should be constant when toolbar bottom docks', NamedChain.asChain([
            NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),

            // Scroll so that the editor is fully in view
            cScrollRelativeEditor(editor, 'top', -100),
            NamedChain.direct('body', cTestOpen, 'dialog'),
            NamedChain.direct('dialog', cAssertPos('absolute', 105, -1387), '_'),

            // Scroll so that bottom of window overlaps bottom of editor
            cScrollRelativeEditor(editor, 'bottom', -200),
            NamedChain.direct('dialog', cAssertPos('absolute', 105, -1387), '_'),

            // Scroll so that top of window overlaps top of editor
            cScrollRelativeEditor(editor, 'top', 200),
            NamedChain.direct('dialog', cAssertPos('fixed', 105, 0), '_'),

            NamedChain.direct('body', DialogUtils.cClose, '_'),
            NamedChain.outputInput
          ])),
          Chain.label('Test position when resizing', NamedChain.asChain([
            NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
            NamedChain.writeValue('container', Element.fromDom(editor.getContainer())),
            NamedChain.direct('body', UiFinder.cFindIn('.tox-statusbar__resize-handle'), 'resizeHandle'),

            cScrollRelativeEditor(editor, 'top', -100),
            NamedChain.direct('body', cTestOpen, 'dialog'),
            NamedChain.direct('dialog', cAssertPos('absolute', 105, -1387), '_'),

            // Shrink the editor to 300px
            NamedChain.direct('resizeHandle', Mouse.cMouseDown, '_'),
            NamedChain.direct('body', cResizeToPos(600, 400, 600, 300), '_'),
            NamedChain.direct('dialog', cAssertPos('absolute', 105, -1287), '_'),

            NamedChain.direct('body', DialogUtils.cClose, '_'),
            NamedChain.outputInput
          ])),
        ])
      ], () => {
        teardownPageScroll();
        onSuccess(editor);
      }, onFailure);
    }),
    McEditor.cRemove
  ]);

  const sToolbarBottomInlineStep = Chain.asStep({}, [
    McEditor.cFromHtml('<div style="width: 600px; height: 400px;"></div>', {
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      inline: true,
      toolbar_location: 'bottom'
    }),
    Chain.async((editor: Editor, onSuccess, onFailure) => {
      const cTestOpen = createTestOpenChain(editor);
      const teardownPageScroll = setupPageScroll(editor, 1000);

      Pipeline.async({ }, [
        Chain.asStep(Body.body(), [
          Chain.label('Position of dialog should be constant when toolbar bottom docks', NamedChain.asChain([
            NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),

            // Scroll so that the editor is fully in view
            cScrollRelativeEditor(editor, 'top', -100),
            Chain.op(() => editor.focus()),
            NamedChain.read('body', UiFinder.cWaitForVisible('Wait for editor', '.tox-tinymce-inline')),
            NamedChain.direct('body', cTestOpen, 'dialog'),
            NamedChain.direct('dialog', cAssertPos('absolute', 106, -1388), '_'),

            // Scroll so that bottom of window overlaps bottom of editor
            cScrollRelativeEditor(editor, 'bottom', -200),
            NamedChain.direct('dialog', cAssertPos('absolute', 106, -1388), '_'),

            // Scroll so that top of window overlaps top of editor
            cScrollRelativeEditor(editor, 'top', 200),
            NamedChain.direct('dialog', cAssertPos('fixed', 106, 0), '_'),

            NamedChain.direct('body', DialogUtils.cClose, '_'),
            NamedChain.outputInput
          ]))
        ])
      ], () => {
        teardownPageScroll();
        onSuccess(editor);
      }, onFailure);
    }),
    McEditor.cRemove
  ]);

  Pipeline.async({}, [
    sToolbarTopStep,
    sToolbarBottomStep,
    sToolbarBottomInlineStep
  ], success, failure);
});
