import { Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import CodePlugin from 'tinymce/plugins/codesample/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TestUtils from '../module/CodeSampleTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.codesample.DblClickCodesampleTest', (success, failure) => {

  CodePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {

    const dialogSelector = 'div.tox-dialog';
    const docBody = SugarElement.fromDom(document.body);
    const editorBody = editor.contentDocument.body;
    const markupContent = '<p>hello world</p>';
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      [
        Log.stepsAsStep(
          'TBA',
          'CodeSample: TBA-Open the dialog and check it has the right initial values. ' +
          'Set the codesample content, submit and check the editor content changes correctly. ' +
          'Double-click on the editor and check if the dialog opens with the correct language and content.', [
            TestUtils.sOpenDialogAndAssertInitial(editor, docBody, 'markup', ''),
            TestUtils.sSetTextareaContent(markupContent),
            TestUtils.sSubmitDialog(docBody),
            TestUtils.sAssertEditorContents(editorBody, 'markup', markupContent, 'pre.language-markup'),
            Step.sync(() => {
              const pre = editor.getBody().querySelector('pre');
              editor.fire('dblclick', { target: pre });
            }),
            UiFinder.sWaitForVisible('Waited for dialog to be visible', docBody, dialogSelector),
            TestUtils.sAssertCodeSampleDialog('markup', markupContent)
          ]
        ),

        Log.stepsAsStep('TBA', 'CodeSample: Selecting code sample should update button state', [
          tinyApis.sSetContent('<p>abc</p><pre class="language-markup"><code></code></pre>'),
          tinyApis.sSelect('p', []),
          tinyApis.sNodeChanged(),
          UiFinder.sNotExists(docBody, 'button[aria-pressed="true"]'),
          tinyApis.sSelect('pre.language-markup', []),
          tinyApis.sNodeChanged(),
          UiFinder.sExists(docBody, 'button[aria-pressed="true"]')
        ])
      ]
      , onSuccess, onFailure);
  }, {
    plugins: 'codesample',
    theme: 'silver',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
