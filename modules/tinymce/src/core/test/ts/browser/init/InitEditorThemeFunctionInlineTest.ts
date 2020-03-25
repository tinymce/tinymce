import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Insert, Element, SelectorFind } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

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
          const body = Element.fromDom(document.body);
          const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
          const editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');

          Assertions.assertDomEq('Should be expected editor container element', editorElement, Element.fromDom(editor.editorContainer));
          Assertions.assertDomEq('Should be expected editor body element', targetElement, Element.fromDom(editor.getBody()));
          Assertions.assertDomEq('Should be expected editor target element', targetElement, Element.fromDom(editor.getElement()));
          Assertions.assertDomEq('Should be expected content area container', targetElement, Element.fromDom(editor.contentAreaContainer));
        }))
      ], onSuccess, onFailure);
    }, {
      theme(editor, target) {
        const elm = Element.fromHtml('<div><button>B</button><div></div></div>');

        Insert.after(Element.fromDom(target), elm);

        return {
          editorContainer: elm.dom()
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
