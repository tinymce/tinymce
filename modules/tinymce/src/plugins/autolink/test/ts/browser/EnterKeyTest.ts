import { Assertions, Keys, Pipeline, Step, Log } from '@ephox/agar';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.autolink.EnterKeyTest', (success, failure) => {

  Theme();
  AutoLinkPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({},
      Log.steps('TINY-1202', 'AutoLink: Focus on editor, set content, set cursor at end of content, assert enter/return keystroke and keydown event', [
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>abcdefghijk</p>'),
        tinyApis.sSetCursor([0, 0], 'abcdefghijk'.length),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        Step.sync(function () {
          try {
            editor.fire('keydown', { keyCode: 13 });
          } catch (error) {
            Assertions.assertEq('should not throw error', true, false);
          }
        }),
    ]), onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
