import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/codesample/Plugin';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('browser.tinymce.plugins.codesample.ChangeLanguageCodeSampleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const jsContent = 'var foo = "bar";';

  it('TBA: Open the dialog and check it has the right initial values. Set the codesample content, submit and check the editor content changes correctly. Re-open the dialog and check the dialog language and content is correct.', async () => {
    const editor = hook.editor();
    await TestUtils.pOpenDialogAndAssertInitial(editor, 'markup', '');
    TestUtils.setLanguage('javascript');
    TestUtils.setTextareaContent(jsContent);
    await TestUtils.pSubmitDialog(editor);
    await TestUtils.pAssertEditorContents(TinyDom.body(editor), 'javascript', jsContent, 'pre.language-javascript');
    await TestUtils.pOpenDialogAndAssertInitial(editor, 'javascript', jsContent);
    await TestUtils.pCancelDialog(editor);
  });
});
