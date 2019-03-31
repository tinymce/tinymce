import { GeneralSteps, Log, Pipeline, UiFinder, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
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
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'Text selection toolbar is not shown', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        sAssertToolbarNotVisible
      ]),
      Log.stepsAsStep('TBA', 'Insert toolbar is not shown', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><p></p>'),
        tinyApis.sSetSelection([1], 0, [1], 0),
        sAssertToolbarNotVisible
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
