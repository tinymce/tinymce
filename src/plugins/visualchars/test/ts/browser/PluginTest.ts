import { Assertions, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { sAssertNbspStruct, sAssertSpanStruct } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.PluginTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'VisualChars: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', [
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
    ]), onSuccess, onFailure);
  }, {
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
