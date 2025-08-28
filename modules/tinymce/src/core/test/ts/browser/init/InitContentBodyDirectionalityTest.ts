import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.core.init.InitContentBodyDirectionalityTest', () => {
  before(() => {
    EditorManager.addI18n('ar', {
      Bold: 'Bold test',
      _dir: 'rtl'
    });
  });

  const getBodyDir = (editor: Editor) => editor.getBody().dir;

  const setContent = (editor: Editor, content: string) => {
    return editor.editorCommands.execCommand('mceSetContent', false, content);
  };

  const runTest = async (settings: RawEditorOptions, label: string, expected: string) => {
    const editor = await McEditor.pFromSettings<Editor>({ base_url: '/project/tinymce/js/tinymce', ...settings });
    setContent(editor, '<p>Hello world!</p>');
    const dir = getBodyDir(editor);
    assert.equal(dir, expected, label);
    McEditor.remove(editor);
  };

  it('TBA: Test default directionality of the editor when set to use a rtl language', () => runTest(
    { language: 'ar' },
    'Directionality should be set to `rtl` by default if the editor is set to a rtl language',
    'rtl'
  ));

  it('TBA: Test directionality of the editor when set using the config option while localized using a rtl language', () => runTest(
    { language: 'ar', directionality: 'ltr' },
    'Directionality should be set to `ltr` as per the config option setting',
    'ltr'
  ));

  it('TBA: Test directionality of editor when using a language with no directionality set', () => runTest(
    { language: 'en' },
    'Directionality should not be set if the editor language does not have a directionality',
    ''
  ));
});
