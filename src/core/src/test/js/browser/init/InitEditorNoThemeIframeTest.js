import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorNoThemeIframeTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Tests if the editor is responsive after setting theme to false', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sAssertContent('<p>a</p>')
      ])),
      Logger.t('Editor element properties', Step.sync(function () {
        var body = Element.fromDom(document.body);
        var targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
        var editorElement = Traverse.nextSibling(targetElement).getOrDie('No elm');

        Assertions.assertDomEq('Should be expected element', editorElement, Element.fromDom(editor.editorContainer));
        Assertions.assertDomEq('Should be expected element', editorElement, Element.fromDom(editor.contentAreaContainer));
        Assertions.assertDomEq('Should be expected element', targetElement, Element.fromDom(editor.getElement()));
      }))
    ], onSuccess, onFailure);
  }, {
    theme: false,
    skin_url: '/project/src/skins/lightgray/dist/lightgray',
    init_instance_callback: function (editor) {
      editor.fire('SkinLoaded');
    }
  }, success, failure);
});

