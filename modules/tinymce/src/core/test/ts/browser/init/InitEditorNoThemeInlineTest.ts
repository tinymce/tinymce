import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, SelectorFind, Traverse } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorNoThemeInlineTest', function (success, failure) {

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
        const nextElement = Traverse.nextSibling(targetElement);

        // TODO FIXME this seems like an odd exception
        Assertions.assertEq('Should be null since inline without a theme does not set editorContainer', null, editor.editorContainer);
        Assertions.assertDomEq('Should be expected editor body element', targetElement, Element.fromDom(editor.getBody()));
        Assertions.assertDomEq('Should be expected editor target element', targetElement, Element.fromDom(editor.getElement()));
        Assertions.assertDomEq('Editor.contentAreaContainer should equal target element', targetElement, Element.fromDom(editor.contentAreaContainer));
        Assertions.assertEq('Should be no element after target', true, nextElement.isNone());
      }))
    ], onSuccess, onFailure);
  }, {
    theme: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce',
    init_instance_callback (editor) {
      editor.fire('SkinLoaded');
    }
  }, success, failure);
});
