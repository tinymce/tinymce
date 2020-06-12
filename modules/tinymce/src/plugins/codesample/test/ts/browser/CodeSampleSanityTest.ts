import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import CodePlugin from 'tinymce/plugins/codesample/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TestUtils from '../module/CodeSampleTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.codesample.CodeSampleSanityTest', (success, failure) => {

  CodePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {

    const docBody = Element.fromDom(document.body);
    const editorBody = editor.contentDocument.body;
    const markupContent = '<p>hello world</p>';
    const newContent = 'editor content should not change to this';

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'CodeSample: Open the dialog and check it has the right initial values', [
        TestUtils.sOpenDialogAndAssertInitial(editor, docBody, 'markup', '')
      ]),

      Log.stepsAsStep('TBA', 'CodeSample: Set the codesample content, submit and check the editor content changes correctly', [
        TestUtils.sSetTextareaContent(markupContent),
        TestUtils.sSubmitDialog(docBody),
        TestUtils.sAssertEditorContents(editorBody, 'markup', markupContent, 'pre.language-markup')
      ]),

      Log.stepsAsStep('TBA', 'CodeSample: Re-open the dialog and check the dialog language and content is correct - focus problems and make this fail', [
        TestUtils.sOpenDialogAndAssertInitial(editor, docBody, 'markup', markupContent)
      ]),

      Log.stepsAsStep('TBA', 'CodeSample: Set the codesample content but CANCEL and check the editor content did not change', [
        TestUtils.sSetTextareaContent(newContent),
        TestUtils.sCancelDialog(docBody),
        TestUtils.sAssertEditorContents(editorBody, 'markup', markupContent, 'pre.language-markup')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'codesample',
    theme: 'silver',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
