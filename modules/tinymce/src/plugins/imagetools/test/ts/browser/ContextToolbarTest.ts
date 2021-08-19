import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { ImageOps } from '../module/test/ImageOps';
import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.ContextToolbarTest', () => {
  const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.gif';

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image imagetools',
    base_url: '/project/tinymce/js/tinymce',
    height: 900
  }, [ ImagePlugin, ImageToolsPlugin, Theme ], true);

  const pOpenContextToolbar = async (editor: Editor, source: string) => {
    await ImageUtils.pLoadImage(editor, source, { width: 460, height: 598 });
    TinySelections.select(editor, 'img', []);
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Rotate counterclockwise"]');
  };

  // Use keyboard shortcut ctrl+F9 to navigate to the context toolbar
  const pressKeyboardShortcutKey = (editor: Editor) => TinyContentActions.keydown(editor, 120, { ctrl: true });
  const pressRightArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.right());

  // Assert focus is on the expected toolbar button
  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  const pWaitForDialogOpenThenCloseDialog = async (editor: Editor, childSelector: string) => {
    await TinyUiActions.pWaitForDialog(editor);
    await TinyUiActions.pWaitForPopup(editor, childSelector);
    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]'));
  };

  const getImageSrc = (editor: Editor) => {
    const dom = editor.dom;
    const element = dom.getParent(editor.selection.getStart(), 'img');
    return dom.getAttrib(element, 'src');
  };

  const pAssertImageFlip = async (editor: Editor, label: string) => {
    const srcBeforeFlip = getImageSrc(editor);
    await ImageOps.pClickContextToolbarButton(editor, label);
    await Waiter.pTryUntilPredicate('Wait for image to flip', () => {
      const newSrc = getImageSrc(editor);
      return newSrc !== srcBeforeFlip;
    });
  };

  it('TBA: context toolbar keyboard navigation test', async () => {
    const editor = hook.editor();
    await pOpenContextToolbar(editor, srcUrl);
    pressKeyboardShortcutKey(editor);
    await pAssertFocusOnItem('Rotate counterclockwise button', 'button[aria-label="Rotate counterclockwise"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Rotate clockwise button', 'button[aria-label="Rotate clockwise"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Flip vertically button', 'button[aria-label="Flip vertically"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Flip horizontally button', 'button[aria-label="Flip horizontally"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Edit image button', 'button[aria-label="Edit image"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Image options button', 'button[aria-label="Image options"]');
    pressRightArrowKey(editor);
    await pAssertFocusOnItem('Rotate counterclockwise button', 'button[aria-label="Rotate counterclockwise"]');
  });

  it('TBA: context toolbar functionality test', async () => {
    const editor = hook.editor();
    await pOpenContextToolbar(editor, srcUrl);
    await ImageOps.pExecToolbar(editor, 'Rotate counterclockwise');
    await Waiter.pTryUntil('Wait for image to be rotated', () => TinyAssertions.assertContentPresence(editor, { 'img[width="598"][height="460"]': 1 }));
    await ImageOps.pExecToolbar(editor, 'Rotate clockwise');
    await Waiter.pTryUntil('Wait for image to be rotated', () => TinyAssertions.assertContentPresence(editor, { 'img[width="460"][height="598"]': 1 }));
    await pAssertImageFlip(editor, 'Flip horizontally');
    await pAssertImageFlip(editor, 'Flip vertically');
    await ImageOps.pClickContextToolbarButton(editor, 'Edit image');
    /* Previously there was a fixed wait here, waiting for the dialog to display.
    Without this wait, you can't see the dialog if you're watching the test.
    However, the below DOM assertions insist that the dialog is, indeed, there.
    */
    await pWaitForDialogOpenThenCloseDialog(editor, 'div.tox-image-tools__image>img');
    await ImageOps.pClickContextToolbarButton(editor, 'Image options');
    await pWaitForDialogOpenThenCloseDialog(editor, 'div.tox-form');
  });
});
