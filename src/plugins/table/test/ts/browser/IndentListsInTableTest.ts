import { GeneralSteps } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('tinymce.plugins.table.IndentListsInTableTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TablePlugin();
  ListsPlugin();

  const sAssertTableInnerHTML = function (editor, expected) {
    return Step.sync(function () {
      const actual = editor.getBody().firstChild.innerHTML;
      RawAssertions.assertEq('Does not have correct html', expected, actual);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,

      Logger.t('ul > li in table', GeneralSteps.sequence([
        tinyApis.sSetContent('<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 1], 1),
        tinyActions.sContentKeystroke(Keys.tab(), {}),
        sAssertTableInnerHTML(editor, '<tbody><tr><td><ul><li>a<ul><li>b</li></ul></li></ul></td></tr></tbody>')
      ])),

      Logger.t('ol > li in table', GeneralSteps.sequence([
        tinyApis.sSetContent('<table><tbody><tr><td><ol><li>a</li><li>b</li></ol></td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 1], 1),
        tinyActions.sContentKeystroke(Keys.tab(), {}),
        sAssertTableInnerHTML(editor, '<tbody><tr><td><ol><li>a<ol><li>b</li></ol></li></ol></td></tr></tbody>')
      ])),

      Logger.t('dl > dt in table', GeneralSteps.sequence([
        tinyApis.sSetContent('<table><tbody><tr><td><dl><dt>a</dt><dt>b</dt></dl></td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 1], 1),
        tinyActions.sContentKeystroke(Keys.tab(), {}),
        sAssertTableInnerHTML(editor, '<tbody><tr><td><dl><dt>a</dt><dd>b</dd></dl></td></tr></tbody>')
      ]))

    ], onSuccess, onFailure);
  }, {
    plugins: 'lists table',
    toolbar: 'table numlist',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
