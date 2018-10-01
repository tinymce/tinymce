import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.lists.SplitButtonTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  AdvListPlugin();
  ListsPlugin();
  Theme();

  suite.test('Replace splitbutton control with button when advlist_number_styles/advlist_bullet_styles are empty', function (editor) {
    LegacyUnit.equal(editor.buttons.numlist.type, 'button');
    LegacyUnit.equal(editor.buttons.bullist.type, 'button');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'advlist lists',
    advlist_bullet_styles: '',
    advlist_number_styles: '',
    toolbar: 'numlist bullist',
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});
