import { Mouse, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

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

  const testLanguage = async (firstWord: string, language?: string) => {
    const editor = await McEditor.pFromSettings<Editor>({ ...baseSettings, language });
    editor.execCommand('mceHelp');
    const dialogEl = await TinyUiActions.pWaitForDialog(editor);
    Mouse.trueClickOn(SugarBody.body(), `.tox-dialog__body-nav-item:nth-child(2)`);
    UiFinder.exists(dialogEl, `h1:contains("${firstWord}")`);
    McEditor.remove(editor);
  };

  it('TINY-9633: Can load English by default', async () => testLanguage('Begin'));

  it('TINY-9633: Can load German translation', async () => testLanguage('Grundlagen', 'de'));
});
