import { Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.quickbars.ContentEditableTest', (success, failure) => {

  Theme();
  QuickbarsPlugin();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sAssertToolbarVisible = tinyUi.sWaitForUi('wait for toolbar to show', '.tox-toolbar');
    const sAssertToolbarNotVisible = Waiter.sTryUntil('toolbar should not exist', UiFinder.sNotExists(Body.body(), '.tox-toolbar'));

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false', [
        tinyApis.sSetContent('<p>abc</p><p contenteditable="false">cab</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertToolbarVisible,
        tinyApis.sSelect('p[contenteditable=false]', []),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false parent, select parent', [
        tinyApis.sSetContent('<div><p>abc</p></div><div contenteditable="false"><p>cab</p></div>'),
        tinyApis.sSelect('div', []),
        sAssertToolbarVisible,
        tinyApis.sSelect('div[contenteditable=false]', []),
        sAssertToolbarNotVisible,
      ]),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false parent, select child of parent', [
        tinyApis.sSetContent('<div><p>abc</p></div><div contenteditable="false"><p>cab</p></div>'),
        tinyApis.sSelect('div p', []),
        sAssertToolbarVisible,
        tinyApis.sSelect('div[contenteditable=false] p', []),
        sAssertToolbarNotVisible,
      ]),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false span, select span', [
        tinyApis.sSetContent('<p>abc</p><p>abc <span contenteditable="false">click on me</span> 123</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertToolbarVisible,
        tinyApis.sSelect('p span', []),
        sAssertToolbarNotVisible,
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
