import { Mouse, UiFinder } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import Plugin from 'tinymce/plugins/help/Plugin';

describe('browser.tinymce.plugins.help.KeyboardNavTabI18nTest', () => {
  before(() => {
    Plugin();
  });

  const baseSettings: RawEditorOptions = {
    plugins: 'help',
    toolbar: 'help',
    base_url: '/project/tinymce/js/tinymce'
  };

  const createEditorWithLanguage = (language?: string): Promise<Editor> => McEditor.pFromSettings<Editor>({ ...baseSettings, language });

  const openHelpDialogKeyboardNavigationTab = async (editor: Editor): Promise<SugarElement<Element>> => {
    editor.execCommand('mceHelp');
    const dialogEl = await TinyUiActions.pWaitForDialog(editor);
    Mouse.trueClickOn(SugarBody.body(), `.tox-dialog__body-nav-item:nth-child(2)`);
    return dialogEl;
  };

  context('Test language load', () => {
    const testLanguage = async (firstWord: string, language?: string): Promise<void> => {
      const editor = await createEditorWithLanguage(language);
      const dialogEl = await openHelpDialogKeyboardNavigationTab(editor);
      UiFinder.exists(dialogEl, `h1:contains("${firstWord}")`);
      McEditor.remove(editor);
    };

    it('TINY-9633: Can load English by default', () => testLanguage('Begin'));
    it('TINY-9633: Can load English', () => testLanguage('Begin', 'en'));
    it('TINY-9633: Can load German', () => testLanguage('Grundlagen', 'de'));
  });

  it('TINY-9920: Fallback HTML is the same as the HTML loaded from English file', async () => {
    const getKeyboardNavHtml = async (language: string): Promise<string> => {
      const editor = await createEditorWithLanguage(language);
      const dialogEl = await openHelpDialogKeyboardNavigationTab(editor);
      const keyboardNavContentEl = UiFinder.findIn(dialogEl, '.tox-dialog__body-content [role="document"]')
        .getOrThunk(() => assert.fail('Could not find Keyboard Navigation content element'));
      McEditor.remove(editor);
      return keyboardNavContentEl.dom.innerHTML;
    };

    const fallbackHtml = await getKeyboardNavHtml('invalid');
    const englishHtml = await getKeyboardNavHtml('en');

    assert.equal(fallbackHtml, englishHtml, 'Fallback HTML should be the same as the one loaded from English HTML file');
  });
});
