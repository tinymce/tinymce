import { Pipeline, Log, Chain, Assertions, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi, UiChains } from '@ephox/mcagar';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.code.CodeTextareaTest', (success, failure) => {

  CodePlugin();
  SilverTheme();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);

    const cOpenDialog = Chain.fromChains([
      Chain.op(() => {
        return editor.execCommand('mceCodeEditor');
      }),
      tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
    ]);

    const cGetWhiteSpace = Chain.mapper(() => {
      const element = editor.getElement();
      return editor.dom.getStyle(element, 'white-space', true);
    });

    const cAssertWhiteSpace = () => {
      return NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cOpenDialog, 'element'),
        NamedChain.direct('element', cGetWhiteSpace, 'whitespace'),
        NamedChain.read('whitespace', Chain.op((whitespace) => {
          Assertions.assertEq('Textarea should have "white-space: pre-wrap"', 'pre-wrap', whitespace);
        }))
      ]);
    };

    const sAssertStyleExits = Chain.asStep({editor}, [
      cAssertWhiteSpace(),
      UiChains.cCloseDialog('div[role="dialog"]')
    ]);

    // Test verifies that new lines and whitespaces are allowed within the textarea in Firefox and IE
    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Code: Verify if "white-space: pre-wrap" style is set on the textarea', [
        sAssertStyleExits
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'code',
    theme: 'silver',
    toolbar: 'code',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
