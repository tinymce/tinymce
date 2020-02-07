import { Chain, Keys, Mouse, Pipeline, UiControls, UiFinder, Log } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element, Body } from '@ephox/sugar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('Browser Test: .AnchorInlineTest', (success, failure) => {

  AnchorPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    const tinyui = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Anchor: Add anchor by selecting text content, then check that anchor is inserted correctly', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>abc 123</p>'),
        tinyApis.sSetSelection([0, 0], 4, [0, 0], 7),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sExecCommand('mceanchor'),
        Chain.asStep(Element.fromDom(document.body), [
          Chain.fromParent(UiFinder.cWaitForVisible('wait for dialog', 'div[role="dialog"].tox-dialog'), [
              Chain.fromChains([
                UiFinder.cFindIn('input'),
                UiControls.cSetValue('abc')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Save")'),
                Mouse.cClick
              ])
            ]
          )
        ]),
        tinyApis.sAssertContent('<p>abc <a id="abc"></a>123</p>')
      ]),
      Log.stepsAsStep( 'TBA', 'Anchor inserted into subtext', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p>lowertext<sup>Suptext</sup></p>'),
        tinyApis.sSetSelection([0, 1, 0], 7, [0, 1, 0 ], 7),
        tinyApis.sExecCommand('mceanchor'),
        tinyui.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog'),
        UiControls.sSetValueOn( Body.body(), 'input.tox-textfield', 'Test'),
        tinyui.sClickOnUi('click save btn', '.tox-dialog__footer .tox-button:not(.tox-button--secondary)'),
        tinyApis.sAssertContentPresence( {'a.mce-item-anchor#Test': 1}),
      ]),
    ],


    onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
