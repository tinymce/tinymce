import { Assertions } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.autolink.EnterKeyTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  AutoLinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyActions = TinyActions(editor);

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
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

