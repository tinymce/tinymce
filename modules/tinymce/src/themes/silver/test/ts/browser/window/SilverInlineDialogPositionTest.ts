import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Height, Insert, Remove, Scroll, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';
import * as PageScroll from '../../module/PageScroll';
import { resizeToPos, scrollRelativeEditor } from '../../module/UiUtils';

describe('browser.tinymce.themes.silver.window.SilverInlineDialogPositionTest', () => {
  const dialogSpec: Dialog.DialogSpec<{}> = {
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

  const pAssertPos = (dialog: SugarElement<HTMLElement>, pos: string, x: number, y: number) =>
    Waiter.pTryUntil('Wait for dialog position to update', () => {
      const diff = 5;
      const position = Css.get(dialog, 'position');
      const top = dialog.dom.offsetTop;
      const left = dialog.dom.offsetLeft;
      assert.equal(position, pos, `Dialog position (${position}) should be ${pos}`);
      assert.approximately(top, y, diff, `Dialog top position (${top}px) should be ~${y}px`);
      assert.approximately(left, x, diff, `Dialog left position (${left}px) should be ~${x}px`);
    });

  const openDialog = (editor: Editor): SugarElement<HTMLElement> => {
    DialogUtils.open(editor, dialogSpec, { inline: 'toolbar' });
    const dialog = UiFinder.findIn(SugarBody.body(), '.tox-dialog-inline').getOrDie();
    return Traverse.parent(dialog).getOr(dialog) as SugarElement<HTMLElement>;
  };

  context('Top toolbar positioning', () => {
    Arr.each([
      { name: 'normal', settings: { ui_mode: 'combined' }},
      { name: 'normal-split-ui-mode', settings: { ui_mode: 'split' }}
    ], (tester) => {
      context(tester.name, () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          resize: 'both',
          height: 400,
          width: 650,
          toolbar_sticky: false,
          toolbar_mode: 'wrap',
          ...tester.settings
        }, []);

        it('Test position when resizing', async () => {
          const editor = hook.editor();
          const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
          const dialog = openDialog(editor);
          await pAssertPos(dialog, 'absolute', 158, -306);

          // Shrink the editor to 300px
          Mouse.mouseDown(resizeHandle);
          resizeToPos(650, 400, 500, 300);
          await pAssertPos(dialog, 'absolute', 5, -166); // Toolbar wraps so y diff is 100 + toolbar height

          // Enlarge the editor to 500px
          Mouse.mouseDown(resizeHandle);
          resizeToPos(500, 300, 750, 500);
          await pAssertPos(dialog, 'absolute', 258, -406);

          // Resize back to the original size
          Mouse.mouseDown(resizeHandle);
          resizeToPos(750, 500, 650, 400);
          await pAssertPos(dialog, 'absolute', 158, -306);

          DialogUtils.close(editor);
        });

        it('Test position when scrolling', async () => {
          const editor = hook.editor();
          const dialog = openDialog(editor);

          // Enlarge the editor to 2000px
          Height.set(TinyDom.container(editor), 2000);
          editor.dispatch('ResizeEditor');
          await pAssertPos(dialog, 'absolute', 158, -1901);

          // Scroll to 1500px and assert docked
          Scroll.to(0, 1500);
          await pAssertPos(dialog, 'fixed', 158, 0);

          // Scroll back to top and assert not docked
          Scroll.to(0, 0);
          await pAssertPos(dialog, 'absolute', 158, -1906);

          DialogUtils.close(editor);
        });

        it('Test initial position when initially scrolled', async () => {
          const editor = hook.editor();

          // Enlarge the editor to 2000px
          Height.set(TinyDom.container(editor), 2000);
          editor.dispatch('ResizeEditor');

          // Scroll to 1500px, open the dialog and assert docked
          Scroll.to(0, 1500);
          const dialog = openDialog(editor);
          await pAssertPos(dialog, 'fixed', 158, 0);

          // Scroll back to top and assert not docked
          Scroll.to(0, 0);
          await pAssertPos(dialog, 'absolute', 158, -1906);

          DialogUtils.close(editor);
        });
      });
    });
  });

  context('TINY-9554: dialog position with editor in fixed container', () => {
    const setupElement = () => {
      const container = SugarElement.fromHtml('<div class="container" style="position: fixed; top: 150px; left: 150px;"></div>');
      const element = SugarElement.fromTag('textarea');

      Insert.append(SugarBody.body(), container);
      Insert.append(container, element);

      return {
        element,
        teardown: () => {
          Remove.remove(element);
          Remove.remove(container);
        }
      };
    };

    const hook = TinyHooks.bddSetupFromElement<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      height: 400,
      width: 650,
      menubar: false
    }, setupElement, []);

    it('TINY-9554: the dialog should be below the toolbar of the editor', () => {
      const editor = hook.editor();
      const dialog = openDialog(editor);
      const editorToolbar = UiFinder.findIn(TinyDom.container(editor), '.tox-editor-header').getOrDie();

      assert.isTrue(editorToolbar.dom.getBoundingClientRect().bottom < dialog.dom.getBoundingClientRect().top);

      DialogUtils.close(editor);
    });
  });

  context('Bottom toolbar positioning', () => {
    Arr.each([
      { name: 'normal', settings: { ui_mode: 'combined' }},
      { name: 'normal-split-ui-mode', settings: { ui_mode: 'split' }}
    ], (tester) => {
      context(tester.name, () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce',
          height: 400,
          width: 600,
          toolbar_sticky: true,
          toolbar_location: 'bottom',
          ...tester.settings
        }, []);

        PageScroll.bddSetup(hook.editor, 1000);

        it('Position of dialog should be constant when toolbar bottom docks', async () => {
          const editor = hook.editor();

          // Scroll so that the editor is fully in view
          scrollRelativeEditor(editor, 'top', -100);
          const dialog = openDialog(editor);
          await pAssertPos(dialog, 'absolute', 108, -1387);

          // Scroll so that bottom of window overlaps bottom of editor
          scrollRelativeEditor(editor, 'bottom', -200);
          await pAssertPos(dialog, 'absolute', 108, -1387);

          // Scroll so that top of window overlaps top of editor
          scrollRelativeEditor(editor, 'top', 200);
          await pAssertPos(dialog, 'fixed', 108, 0);

          DialogUtils.close(editor);
        });

        it('Test position when resizing', async () => {
          const editor = hook.editor();
          const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

          scrollRelativeEditor(editor, 'top', -100);
          const dialog = openDialog(editor);
          await pAssertPos(dialog, 'absolute', 108, -1387);

          // Shrink the editor to 300px
          Mouse.mouseDown(resizeHandle);
          resizeToPos(600, 400, 600, 300);
          await pAssertPos(dialog, 'absolute', 108, -1287);

          DialogUtils.close(editor);
        });
      });
    });
  });

  context('Bottom toolbar with inline editor positioning', () => {
    Arr.each([
      { name: 'inline', settings: { ui_mode: 'combined' }, sinkSeparatedByScrollDiv: false },
      { name: 'inline-split-ui-mode', settings: { ui_mode: 'split' }, sinkSeparatedByScrollDiv: true }
    ], (tester) => {
      context(tester.name, () => {
        const hook = TinyHooks.bddSetupFromElement<Editor>({
          theme: 'silver',
          base_url: '/project/tinymce/js/tinymce',
          inline: true,
          toolbar_location: 'bottom',
          ...tester.settings
        }, () => {
          const div = SugarElement.fromHtml<HTMLDivElement>('<div style="width: 600px; height: 400px;"></div>');
          return {
            element: div,
            teardown: () => Remove.remove(div)
          };
        }, []);

        // This scroll div is inserted before and after the target, so the popup sink that
        // gets added for inline mode in ui_mode: split is separated from the dialog sink
        // by the height of one scroll div
        const scrollDivHeight = 1000;
        PageScroll.bddSetup(hook.editor, scrollDivHeight);

        it('Position of dialog should be constant when toolbar bottom docks', async () => {
          const editor = hook.editor();

          // When in two sink mode (ui_mode: split), we need to consider the height of the scrollDiv when
          // comparing *absolute* positions.
          const yDelta = tester.sinkSeparatedByScrollDiv ? scrollDivHeight : 0;

          // Scroll so that the editor is fully in view
          scrollRelativeEditor(editor, 'top', -100);
          editor.focus();
          await TinyUiActions.pWaitForPopup(editor, '.tox-tinymce-inline');
          const dialog = openDialog(editor);
          await pAssertPos(dialog, 'absolute', 106, -1388 + yDelta);

          // Scroll so that bottom of window overlaps bottom of editor
          scrollRelativeEditor(editor, 'bottom', -200);
          await pAssertPos(dialog, 'absolute', 106, -1388 + yDelta);

          // Scroll so that top of window overlaps top of editor
          scrollRelativeEditor(editor, 'top', 200);
          // We don't need to consider the height of the scrollDiv for things with fixed positioning
          await pAssertPos(dialog, 'fixed', 106, 0);

          DialogUtils.close(editor);
        });
      });
    });
  });
});
