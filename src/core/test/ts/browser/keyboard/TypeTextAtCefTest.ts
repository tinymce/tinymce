import { GeneralSteps, Keys, Logger, Pipeline } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import TypeText from '../../module/test/TypeText';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.TypeTextAtCef', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Type text before cef inline element', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
        tinyApis.sSelect('p', [1]),
        tinyActions.sContentKeystroke(Keys.left(), {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
        tinyApis.sAssertContent('<p>bc<span contenteditable="false">a</span></p>')
      ])),
      Logger.t('Type after cef inline element', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
        tinyApis.sSelect('p', [1]),
        tinyActions.sContentKeystroke(Keys.right(), {}),
        TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
        tinyApis.sAssertSelection([0, 1], 3, [0, 1], 3),
        tinyApis.sAssertContent('<p><span contenteditable="false">a</span>bc</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
