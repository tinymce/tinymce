import { GeneralSteps, Log, Pipeline, UiFinder, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.quickbars.ToolbarFalseTest', (success, failure) => {

  Theme();
  QuickbarsPlugin();

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertToolbarNotVisible = GeneralSteps.sequence([
      // We can't wait for something to happen, as nothing will change. So instead, just wait some time for when the toolbar would have normally shown
      Step.wait(200),
      UiFinder.sNotExists(Body.body(), '.tox-pop__dialog .tox-toolbar')
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Insert toolbar is not shown', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><p></p>'),
        tinyApis.sSetSelection([1], 0, [1], 0),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Image toolbar is not shown', [
        tinyApis.sSetContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>'),
        tinyApis.sSetSelection([0], 0, [0], 0),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false', [
        tinyApis.sSetContent('<p contenteditable="false">abc</p>'),
        tinyApis.sSelect('p', [0]),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown with contenteditable=false parent', [
        tinyApis.sSetContent('<div contenteditable="false"><p>cab</p></div>'),
        tinyApis.sSelect('div', [0]),
        sAssertToolbarNotVisible,
        tinyApis.sSelect('p', [0]),
        Step.wait(5000),
        sAssertToolbarNotVisible,
      ]),
      Log.stepsAsStep('TBA', 'Image toolbar is not shown with contenteditable=false', [
        tinyApis.sSetContent('<p><img contenteditable="false" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>'),
        tinyApis.sSelect('img', []),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Image toolbar is not shown with contenteditable=false parent', [
        tinyApis.sSetContent('<p contenteditable="false"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>'),
        tinyApis.sSelect('img', []),
        sAssertToolbarNotVisible
      ]),
    ], onSuccess, onFailure);
  }, {
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: false,
    quickbars_image_toolbar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
