import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import SpellcheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.plugins.spellchecker.SpellcheckerTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  SpellcheckerPlugin();

  var sCheckButtonType = function (editor, expected) {
    return Step.sync(function () {
      var button = editor.buttons.spellchecker;

      RawAssertions.assertEq('should have same type', expected, button.type);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      sCheckButtonType(editor, 'splitbutton')
    ], onSuccess, onFailure);
  }, {
    plugins: 'spellchecker',
    toolbar: 'spellchecker',
    spellchecker_languages: 'English=en,French=fr,German=de',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

