import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, SelectorFind, Traverse } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorNoThemeIframeTest', function (success, failure) {

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Tests if the editor is responsive after setting theme to false', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sAssertContent('<p>a</p>')
      ])),
      Logger.t('Editor element properties', Step.sync(function () {
        const body = Element.fromDom(document.body);
        const targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
        const editorElement = Traverse.nextSibling(targetElement).getOrDie('No elm');

        Assertions.assertDomEq('Should be expected element', editorElement, Element.fromDom(editor.editorContainer));
        Assertions.assertDomEq('Should be expected element', editorElement, Element.fromDom(editor.contentAreaContainer));
        Assertions.assertDomEq('Should be expected element', targetElement, Element.fromDom(editor.getElement()));
      }))
    ], onSuccess, onFailure);
  }, {
    theme: false,
    base_url: '/project/tinymce/js/tinymce',
    init_instance_callback(editor) {
      editor.fire('SkinLoaded');
    }
  }, success, failure);
});
