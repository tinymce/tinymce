import { Chain } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiControls } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Browser Test: .AnchorInlineTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  AnchorPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      tinyApis.sSetContent('<p>abc 123</p>'),
      tinyApis.sSetSelection([0, 0], 4, [0, 0], 7),
      tinyActions.sContentKeystroke(Keys.space(), {}),
      tinyApis.sExecCommand('mceanchor'),
      Chain.asStep(Element.fromDom(document.body), [
        Chain.fromParent(UiFinder.cWaitForVisible('wait for dialog', 'div[aria-label="Anchor"][role="dialog"]'),
          [
            Chain.fromChains([
              UiFinder.cFindIn('input'),
              UiControls.cSetValue('abc')
            ]),
            Chain.fromChains([
              UiFinder.cFindIn('button:contains("Ok")'),
              Mouse.cClick
            ])
          ]
        )
      ]),
      tinyApis.sAssertContent('<p>abc <a id="abc"></a>123</p>')

    ], onSuccess, onFailure);
  }, {
    inline: true,
    plugins: 'anchor',
    toolbar: 'anchor',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
