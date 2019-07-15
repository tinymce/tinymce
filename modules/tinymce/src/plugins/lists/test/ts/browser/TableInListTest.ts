import { Pipeline, Step, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.TableInListTest', (success, failure) => {

  ListsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Lists: unlist table in list then add list inside table', [
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
        tinyUi.sClickOnToolbar('click list button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li>a</li></ul></td><td>b</td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click list button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>a</p></td><td>b</td></tr></tbody></table></li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: delete list in table test', [
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 0, 0], 1),
        Step.sync(function () {
          editor.plugins.lists.backspaceDelete();
          editor.plugins.lists.backspaceDelete();
        }),
        tinyApis.sAssertSelection([0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0], 0),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>&nbsp;</p></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: focus on table cell in list does not activate button', [
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
        UiFinder.sNotExists(TinyDom.fromDom(editor.getContainer()), 'div[aria-label="Bullet list"][aria-pressed="true"]')
      ]),
      Log.stepsAsStep('TBA', 'Lists: indent and outdent li in ul in list in table in list', [
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1),
        tinyUi.sClickOnToolbar('click increase indent', 'button[aria-label="Increase indent"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click decrease indent', 'button[aria-label="Decrease indent"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyUi.sClickOnToolbar('click decrease indent', 'button[aria-label="Decrease indent"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul><p>b</p></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ]),
      Log.stepsAsStep('TBA', 'Lists: toggle from UL to OL in list in table in list only changes inner list', [
        tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
        tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1),
        tinyUi.sClickOnToolbar('click numlist button', 'button[aria-label="Numbered list"]'),
        tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ol><li><p>a</p></li><li><p>b</p></li></ol></td><td><p>b</p></td></tr></tbody></table></li></ul>')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'lists',
    toolbar: 'bullist numlist indent outdent',
    indent: false,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
