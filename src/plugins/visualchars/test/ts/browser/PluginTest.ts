import { ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import { sAssertNbspStruct, sAssertSpanStruct, sAssertStruct } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.PluginTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('VisualChars: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
        Assertions.sAssertEq('assert equal', 0, editor.dom.select('span').length),
        tinyUi.sClickOnToolbar('click on visualchars button', 'div[aria-label="Show invisible characters"] > button'),
        tinyApis.sAssertContentStructure(sAssertSpanStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'div[aria-label="Show invisible characters"] > button'),
        tinyApis.sAssertContentStructure(sAssertNbspStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'div[aria-label="Show invisible characters"] > button'),
        tinyApis.sAssertContentStructure(sAssertSpanStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'div[aria-label="Show invisible characters"] > button'),
        tinyApis.sAssertContentStructure(sAssertNbspStruct)
      ])),
      Logger.t('VisualChars: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>&lt;img src=&quot;image.png&quot;&gt;&nbsp;</p>'),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertStruct(ApproxStructure.build((s, str) => {
          return [
            s.text(str.is('<img src="image.png">')),
            s.element('span', {})
          ];
        }))),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertStruct(ApproxStructure.build((s, str) => {
          return [
            s.text(str.is('<img src="image.png">')),
            s.text(str.is('\u00a0'))
          ];
        }))),
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'visualchars',
    toolbar: 'visualchars',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
