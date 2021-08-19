import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, Height, Remove, Scroll, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import Theme from 'tinymce/themes/silver/Theme';

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
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      resize: 'both',
      height: 400,
      width: 600,
      toolbar_sticky: false,
      toolbar_mode: 'wrap'
    }, [ Theme ]);

    it('Test position when resizing', async () => {
      const editor = hook.editor();
      const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();
      const dialog = openDialog(editor);
      await pAssertPos(dialog, 'absolute', 105, -310);

      // Shrink the editor to 300px
      Mouse.mouseDown(resizeHandle);
      resizeToPos(600, 400, 500, 300);
      await pAssertPos(dialog, 'absolute', 5, -171); // Toolbar wraps so y diff is 100 + toolbar height

      // Enlarge the editor to 500px
      Mouse.mouseDown(resizeHandle);
      resizeToPos(500, 300, 700, 500);
      await pAssertPos(dialog, 'absolute', 205, -410);

      // Resize back to the original size
      Mouse.mouseDown(resizeHandle);
      resizeToPos(700, 500, 600, 400);
      await pAssertPos(dialog, 'absolute', 105, -310);

      DialogUtils.close(editor);
    });

    it('Test position when scrolling', async () => {
      const editor = hook.editor();
      const dialog = openDialog(editor);

      // Enlarge the editor to 2000px
      Height.set(TinyDom.container(editor), 2000);
      editor.fire('ResizeEditor');
      await pAssertPos(dialog, 'absolute', 105, -1910);

      // Scroll to 1500px and assert docked
      Scroll.to(0, 1500);
      await pAssertPos(dialog, 'fixed', 105, 0);

      // Scroll back to top and assert not docked
      Scroll.to(0, 0);
      await pAssertPos(dialog, 'absolute', 105, -1910);

      DialogUtils.close(editor);
    });

    it('Test initial position when initially scrolled', async () => {
      const editor = hook.editor();

      // Enlarge the editor to 2000px
      Height.set(TinyDom.container(editor), 2000);
      editor.fire('ResizeEditor');

      // Scroll to 1500px, open the dialog and assert docked
      Scroll.to(0, 1500);
      const dialog = openDialog(editor);
      await pAssertPos(dialog, 'fixed', 105, 0);

      // Scroll back to top and assert not docked
      Scroll.to(0, 0);
      await pAssertPos(dialog, 'absolute', 105, -1910);

      DialogUtils.close(editor);
    });
  });

  context('Bottom toolbar positioning', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      height: 400,
      width: 600,
      toolbar_sticky: true,
      toolbar_location: 'bottom'
    }, [ Theme ]);

    PageScroll.bddSetup(hook.editor, 1000);

    it('Position of dialog should be constant when toolbar bottom docks', async () => {
      const editor = hook.editor();

      // Scroll so that the editor is fully in view
      scrollRelativeEditor(editor, 'top', -100);
      const dialog = openDialog(editor);
      await pAssertPos(dialog, 'absolute', 105, -1387);

      // Scroll so that bottom of window overlaps bottom of editor
      scrollRelativeEditor(editor, 'bottom', -200);
      await pAssertPos(dialog, 'absolute', 105, -1387);

      // Scroll so that top of window overlaps top of editor
      scrollRelativeEditor(editor, 'top', 200);
      await pAssertPos(dialog, 'fixed', 105, 0);

      DialogUtils.close(editor);
    });

    it('Test position when resizing', async () => {
      const editor = hook.editor();
      const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

      scrollRelativeEditor(editor, 'top', -100);
      const dialog = openDialog(editor);
      await pAssertPos(dialog, 'absolute', 105, -1387);

      // Shrink the editor to 300px
      Mouse.mouseDown(resizeHandle);
      resizeToPos(600, 400, 600, 300);
      await pAssertPos(dialog, 'absolute', 105, -1287);

      DialogUtils.close(editor);
    });
  });

  context('Bottom toolbar with inline editor positioning', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>({
      theme: 'silver',
      base_url: '/project/tinymce/js/tinymce',
      inline: true,
      toolbar_location: 'bottom'
    }, () => {
      const div = SugarElement.fromHtml<HTMLDivElement>('<div style="width: 600px; height: 400px;"></div>');
      return {
        element: div,
        teardown: () => Remove.remove(div)
      };
    }, [ Theme ]);

    PageScroll.bddSetup(hook.editor, 1000);

    it('Position of dialog should be constant when toolbar bottom docks', async () => {
      const editor = hook.editor();

      // Scroll so that the editor is fully in view
      scrollRelativeEditor(editor, 'top', -100);
      editor.focus();
      await TinyUiActions.pWaitForPopup(editor, '.tox-tinymce-inline');
      const dialog = openDialog(editor);
      await pAssertPos(dialog, 'absolute', 106, -1388);

      // Scroll so that bottom of window overlaps bottom of editor
      scrollRelativeEditor(editor, 'bottom', -200);
      await pAssertPos(dialog, 'absolute', 106, -1388);

      // Scroll so that top of window overlaps top of editor
      scrollRelativeEditor(editor, 'top', 200);
      await pAssertPos(dialog, 'fixed', 106, 0);

      DialogUtils.close(editor);
    });
  });
});
