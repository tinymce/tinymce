import { Assertions, Keys, Pipeline, Step } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.autolink.EnterKeyTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  AutoLinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      tinyApis.sSetContent('<p>abcdefghijk</p>'),
      tinyApis.sSetCursor([0, 0], 11),
      tinyActions.sContentKeystroke(Keys.enter(), {}),
      Step.sync(function () {
        try {
          editor.fire('keydown', { keyCode: 13 });
        } catch (error) {
          Assertions.assertEq('should not throw error', true, false);
        }
      })
    ], onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
