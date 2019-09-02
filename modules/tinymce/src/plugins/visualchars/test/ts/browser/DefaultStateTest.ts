import { Keyboard, Keys, Pipeline, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { sAssertNbspStruct, sAssertSpanStruct } from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.visualchars.DefaultStateTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('<p>a&nbsp;&nbsp;b</p>'),
      // Need to trigger a keydown event to get the visual chars to show after calling set content
      Keyboard.sKeydown(Element.fromDom(editor.getDoc()), Keys.space(), { }),
      Waiter.sTryUntil('Wait for visual chars to show', tinyApis.sAssertContentStructure(sAssertSpanStruct)),
      tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
      tinyApis.sAssertContentStructure(sAssertNbspStruct),
      tinyUi.sClickOnToolbar('click on visualchars button', 'button'),
      tinyApis.sAssertContentStructure(sAssertSpanStruct)
    ], onSuccess, onFailure);
  }, {
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce',
    visualchars_default_state: true
  }, success, failure);
});
