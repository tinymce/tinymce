import { FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';

import * as TooltipUtils from '../../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.CollectionTooltipTest', () => {
  context('Charmap plugin', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      plugins: 'charmap',
      toolbar: 'charmap',
      charmap_append: [
        [ 0x2600, 'sun' ],
        [ 0x2601, 'cloud' ],
        [ 0x2602, 'umbrella' ]
      ]
    }, [ CharmapPlugin ], true);

    const pOpenDialogAndWaitForLoad = async (editor: Editor, buttonSelector: string) => {
      const doc = SugarDocument.getDocument();
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      await Waiter.pTryUntil('Dialog to stop loading', () => UiFinder.exists(dialog, '[data-mce-tooltip]'));
      Mouse.clickOn(doc, '.tox-dialog__body-nav-item.tox-tab:contains("User Defined")');
      // Waiting for the tab to load, can't use wait for [data-mce-tooltip="sun"] to exist as it's already in the dom, but not shown
      await Waiter.pWait(100);
      FocusTools.setFocus(doc, 'input');
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
    };

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection with keyboard`, async () => {
      const editor = hook.editor();
      editor.focus();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'sun');
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
      }, 'umbrella');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="sun"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'sun');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="charmap"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="sun"]').each((elem) => Mouse.mouseOver(elem));
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="cloud"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'cloud');
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
      }, 'sun');
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
      }, 'sun');
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
      emoticons_append: {
        robot: {
          keywords: [ 'computer', 'machine', 'bot' ],
          char: '🤖',
        },
        dog: {
          keywords: [ 'animal', 'friend', 'nature', 'woof', 'puppy', 'pet', 'faithful' ],
          char: '🐶',
        },
        custom_mind_explode: {
          keywords: [ 'brain', 'mind', 'explode', 'blown' ],
          char: '🤯'
        },
      }
    }, [ EmoticonsPlugin ], true);

    const pOpenDialogAndWaitForLoad = async (editor: Editor, buttonSelector: string) => {
      const doc = SugarDocument.getDocument();
      TinyUiActions.clickOnToolbar(editor, buttonSelector);
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      await Waiter.pTryUntil('Dialog to stop loading', () => UiFinder.exists(dialog, '[data-mce-tooltip]'));
      Mouse.clickOn(doc, '.tox-dialog__body-nav-item.tox-tab:contains("User Defined")');
      // Waiting for the tab to load, can't use wait for [data-mce-tooltip="custom mind explore"] to exist as it's already in the dom, but not shown
      await Waiter.pWait(300);
      FocusTools.setFocus(doc, 'input');
      await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');
    };

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection with keyboard`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        TinyUiActions.keydown(editor, Keys.tab());
        return Promise.resolve();
      }, 'robot');
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
      }, 'custom mind explode');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dog"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'dog');
      TinyUiActions.closeDialog(editor);
    });

    it(`TINY-9637: Should trigger tooltip when focus is shifted in collection item then to next item with mouse`, async () => {
      const editor = hook.editor();
      editor.focus();

      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="emoticons"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="robot"]').each((elem) => Mouse.mouseOver(elem));
        UiFinder.findIn(SugarDocument.getDocument(), '.tox-collection__item[aria-label="dog"]').each((elem) => Mouse.mouseOver(elem));
        return Promise.resolve();
      }, 'dog');
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
      }, 'robot');
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
      }, 'robot');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        FocusTools.setFocus(doc, '.tox-dialog__body-nav-item.tox-tab:contains("People")');
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });
  });
});
