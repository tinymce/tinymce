import { FocusTools, Keys, Mouse, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.TooltipTest', () => {
  context('Charmap plugin', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'charmap',
      toolbar: 'charmap',
    }, [ CharmapPlugin ], true);

    it(`TINY-10453: Should trigger tooltip when focus on collection item`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'dollar sign');
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-10453: Should trigger tooltip when focus is shifted in collection item with keyboard`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        TinyUiActions.keydown(editor, Keys.right());
        TinyUiActions.keydown(editor, Keys.right());
        return Promise.resolve();
      }, 'euro sign');
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-10453: Should trigger tooltip when focus on with mouse hover`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dollar sign"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'dollar sign');
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-10453: Should trigger tooltip when focus on with mouse hover`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dollar sign"]').each((elem) => Mouse.mouseOver(elem));
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="euro sign"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'euro sign');
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-10453: Should trigger tooltip when focus on collection item - focus back to input should remove tooltip`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'dollar sign');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        FocusTools.setFocus(doc, 'input');
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-10453: Should trigger tooltip when focus on collection item - focus back switching tabs`, async () => {
      const doc = SugarDocument.getDocument();
      const editor = hook.editor();
      editor.focus();

      const buttonSelector = 'button[data-mce-name="charmap"]';
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      await TinyUiActions.pWaitForDialog(editor);
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'dollar sign');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        FocusTools.setFocus(doc, '.tox-dialog__body-nav-item.tox-tab:contains("Extended Latin")');
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });
  });
});
