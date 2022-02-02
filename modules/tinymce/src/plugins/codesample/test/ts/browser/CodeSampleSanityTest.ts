import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/codesample/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('browser.tinymce.plugins.codesample.CodeSampleSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const markupContent = '<p>hello world</p>';
  const newContent = 'editor content should not change to this';

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: Open the dialog and check it has the right initial values', async () => {
    const editor = hook.editor();
    await TestUtils.pOpenDialogAndAssertInitial(editor, 'markup', '');
    await TestUtils.pCancelDialog(editor);
  });

  it('TBA: Set the codesample content, submit and check the editor content changes correctly', async () => {
    const editor = hook.editor();
    await TestUtils.pOpenDialogAndAssertInitial(hook.editor(), 'markup', '');
    TestUtils.setTextareaContent(markupContent);
    await TestUtils.pSubmitDialog(editor);
    await TestUtils.pAssertEditorContents(TinyDom.body(editor), 'markup', markupContent, 'pre.language-markup');
  });

  it('TBA: Set the codesample content but CANCEL and check the editor content did not change', async () => {
    const editor = hook.editor();
    await TestUtils.pOpenDialogAndAssertInitial(hook.editor(), 'markup', '');
    TestUtils.setTextareaContent(newContent);
    await TestUtils.pCancelDialog(editor);
    TinyAssertions.assertContent(editor, '');
  });
});
