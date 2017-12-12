import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Insert } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest(
  'browser.tinymce.core.init.InitEditorThemeFunctionIframeTest',
  function() {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Tests if the editor is responsive after setting theme to a function', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sAssertContent('<p>a</p>')
        ])),
        Logger.t('Editor element properties', Step.sync(function () {
          var body = Element.fromDom(document.body);
          var editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');
          var iframeContainerElement = SelectorFind.descendant(body, '#' + editor.id + '_iframecontainer').getOrDie('No elm');

          Assertions.assertDomEq('Should be expected editor container element', editorElement, Element.fromDom(editor.editorContainer));
          Assertions.assertDomEq('Should be expected iframe container element element', iframeContainerElement, Element.fromDom(editor.contentAreaContainer));
        }))
      ], onSuccess, onFailure);
    }, {
      theme: function (editor, target) {
        var elm = Element.fromHtml('<div><button>B</button><div></div></div>');

        Insert.after(Element.fromDom(target), elm);

        return {
          editorContainer: elm.dom(),
          iframeContainer: elm.dom().lastChild
        };
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      init_instance_callback: function (editor) {
        editor.fire('SkinLoaded');
      }
    }, success, failure);
  }
);

