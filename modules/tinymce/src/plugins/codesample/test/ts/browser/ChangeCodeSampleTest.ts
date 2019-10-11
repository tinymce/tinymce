import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import CodePlugin from 'tinymce/plugins/codesample/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import * as TestUtils from '../module/CodeSampleTestUtils';

UnitTest.asynctest('browser.tinymce.plugins.codesample.ChangeLanguageCodeSampleTest', (success, failure) => {

  CodePlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {

    const docBody = Element.fromDom(document.body);
    const editorBody = editor.contentDocument.body;
    const jsContent = 'var foo = "bar";';

    Pipeline.async({},
      Log.steps('TBA', 'CodeSample: Open the dialog and check it has the right initial values. Set the codesample content, submit and check the editor content changes correctly. Re-open the dialog and check the dialog language and content is correct.', [
        TestUtils.sOpenDialogAndAssertInitial(editor, docBody, 'markup', ''),
        TestUtils.sSetLanguage('javascript'),
        TestUtils.sSetTextareaContent(jsContent),
        TestUtils.sSubmitDialog(docBody),
        TestUtils.sAssertEditorContents(editorBody, 'javascript', jsContent, 'pre.language-javascript'),
        TestUtils.sOpenDialogAndAssertInitial(editor, docBody, 'javascript', jsContent),
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'codesample',
    theme: 'silver',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
