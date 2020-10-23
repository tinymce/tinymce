import { ApproxStructure, Assertions, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { sAssertNbspStruct, sAssertSpanStruct, sAssertStruct } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.PluginTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'VisualChars: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', [
        tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
        Assertions.sAssertEq('assert equal', 0, editor.dom.select('span').length),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertSpanStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertNbspStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertSpanStruct),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertNbspStruct)
      ]),
      Log.stepsAsStep('TINY-4507', 'VisualChars: Set content with HTML like content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', [
        tinyApis.sSetContent('<p>&lt;img src=&quot;image.png&quot;&gt;&nbsp;</p>'),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertStruct(ApproxStructure.build((s, str) => [
          s.text(str.is('<img src="image.png">')),
          s.element('span', {})
        ]))),
        tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
        tinyApis.sAssertContentStructure(sAssertStruct(ApproxStructure.build((s, str) => [
          s.text(str.is('<img src="image.png">')),
          s.text(str.is(Unicode.nbsp))
        ])))
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
