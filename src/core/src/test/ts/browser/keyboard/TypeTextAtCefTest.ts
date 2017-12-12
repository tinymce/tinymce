import { GeneralSteps } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TypeText from 'tinymce/core/test/TypeText';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.keyboard.TypeTextAtCef', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Type text before cef inline element', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
        tinyApis.sSelect('p', [0]),
        tinyActions.sContentKeystroke(Keys.left(), {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
        tinyApis.sAssertContent('<p>bc<span contenteditable="false">a</span></p>')
      ])),
      Logger.t('Type after cef inline element', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
        tinyApis.sSelect('p', [0]),
        tinyActions.sContentKeystroke(Keys.right(), {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
        tinyApis.sAssertSelection([0, 1], 3, [0, 1], 3),
        tinyApis.sAssertContent('<p><span contenteditable="false">a</span>bc</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

