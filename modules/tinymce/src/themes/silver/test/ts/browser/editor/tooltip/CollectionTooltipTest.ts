import { FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.CollectionTooltipTest', () => {
  const pOpenDialogAndWaitForLoad = async (editor: Editor, buttonSelector: string) => {
    const doc = SugarDocument.getDocument();
    TinyUiActions.clickOnToolbar(editor, buttonSelector);
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    await Waiter.pTryUntil('Dialog to stop loading', () => UiFinder.exists(dialog, '[data-mce-tooltip]'));
    await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
  };

  context('Charmap plugin', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'charmap',
      toolbar: 'charmap',
    }, [ CharmapPlugin ], true);

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection with keyboard`, async () => {
      const editor = hook.editor();
      editor.focus();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'dollar sign');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with keyboard `, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        TinyUiActions.keydown(editor, Keys.right());
        TinyUiActions.keydown(editor, Keys.right());
        return Promise.resolve();
      }, 'euro sign');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dollar sign"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'dollar sign');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dollar sign"]').each((elem) => Mouse.mouseOver(elem));
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="euro sign"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'euro sign');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should hide tooltip when focus is shifted from collection item to input`, async () => {
      const editor = hook.editor();
      editor.focus();

      const doc = SugarDocument.getDocument();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
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

    it(`TINY-9637: Should hide tooltip when focus is shifted from collection item to next tab`, async () => {
      const editor = hook.editor();
      editor.focus();

      const doc = SugarDocument.getDocument();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
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

  context('Emoticons plugin', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'emoticons',
      toolbar: 'emoticons',
    }, [ EmoticonsPlugin ], true);

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection with keyboard`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, '100');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with keyboard `, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        TinyUiActions.keydown(editor, Keys.right());
        TinyUiActions.keydown(editor, Keys.right());
        return Promise.resolve();
      }, 'grinning');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="kissing smiling eyes"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'kissing smiling eyes');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="heart eyes"]').each((elem) => Mouse.mouseOver(elem));
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="stuck out tongue closed eyes"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'stuck out tongue closed eyes');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should hide tooltip when focus is shifted from collection item to input`, async () => {
      const editor = hook.editor();
      editor.focus();

      const doc = SugarDocument.getDocument();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, '100');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        FocusTools.setFocus(doc, 'input');
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should hide tooltip when focus is shifted from collection item to next tab`, async () => {
      const editor = hook.editor();
      editor.focus();

      const doc = SugarDocument.getDocument();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, '100');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        FocusTools.setFocus(doc, '.tox-dialog__body-nav-item.tox-tab:contains("People")');
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });
  });
});
