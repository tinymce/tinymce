import { GeneralSteps, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.TableInListTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  ListsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Logger.t('unlist table in list then add list inside table', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
        tinyUi.sClickOnToolbar('click list button', 'div[aria-label="Bullet list"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li>a</li></ul></td><td>b</td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click list button', 'div[aria-label="Bullet list"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>a</p></td><td>b</td></tr></tbody></table></li></ul>')
      ])),
      Logger.t('delete list in table test', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 0, 0], 1),
        Step.sync(function () {
          editor.plugins.lists.backspaceDelete();
          editor.plugins.lists.backspaceDelete();
        }),
        tinyApis.sAssertSelection([0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0], 0),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>&nbsp;</p></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ])),
      Logger.t('focus on table cell in list does not activate button', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
        UiFinder.sNotExists(TinyDom.fromDom(editor.getContainer()), 'div[aria-label="Bullet list"][aria-pressed="true"]')
      ])),
      Logger.t('indent and outdent li in ul in list in table in list', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1),
        tinyUi.sClickOnToolbar('click increase indent', 'div[aria-label="Increase indent"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click decrease indent', 'div[aria-label="Decrease indent"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click decrease indent', 'div[aria-label="Decrease indent"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul><p>b</p></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ])),
      Logger.t('toggle from UL to OL in list in table in list only changes inner list', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1),
        tinyUi.sClickOnToolbar('click numlist button', 'div[aria-label="Numbered list"] button'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ol><li><p>a</p></li><li><p>b</p></li></ol></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ]))
    ], onSuccess, onFailure);
  }, {
    plugins: 'lists',
    toolbar: 'bullist numlist indent outdent',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
