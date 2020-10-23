import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Insert, SelectorFind, SugarElement } from '@ephox/sugar';

UnitTest.asynctest(
  'browser.tinymce.core.init.InitEditorThemeFunctionInlineTest',
  function (success, failure) {

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Tests if the editor is responsive after setting theme to a function', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sAssertContent('<p>a</p>')
        ])),
        Logger.t('Editor element properties', Step.sync(function () {
          const body = SugarElement.fromDom(document.body);
          const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
          const editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');

          Assertions.assertDomEq('Should be expected editor container element', editorElement, SugarElement.fromDom(editor.editorContainer));
          Assertions.assertDomEq('Should be expected editor body element', targetElement, SugarElement.fromDom(editor.getBody()));
          Assertions.assertDomEq('Should be expected editor target element', targetElement, SugarElement.fromDom(editor.getElement()));
          Assertions.assertDomEq('Should be expected content area container', targetElement, SugarElement.fromDom(editor.contentAreaContainer));
        }))
      ], onSuccess, onFailure);
    }, {
      theme(editor, target) {
        const elm = SugarElement.fromHtml('<div><button>B</button><div></div></div>');

        Insert.after(SugarElement.fromDom(target), elm);

        return {
          editorContainer: elm.dom
        };
      },
      base_url: '/project/tinymce/js/tinymce',
      inline: true,
      init_instance_callback(editor) {
        editor.fire('SkinLoaded');
      }
    }, success, failure);
  }
);
