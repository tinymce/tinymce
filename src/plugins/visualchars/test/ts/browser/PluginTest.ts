import { Assertions, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import { sAssertNbspStruct, sAssertSpanStruct } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.PluginTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
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
    ], onSuccess, onFailure);
  }, {
    plugins: 'visualchars',
    toolbar: 'visualchars',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
