import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.ChangeListStyleTest', (success, failure) => {

  ListsPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Lists: ul to ol, cursor only in parent', [
        tinyApis.sSetContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click numlist button', 'button[aria-label="Numbered list"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ul><li>b</li></ul></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Lists: ul to ol, selection from parent to sublist', [
        tinyApis.sSetContent('<ul><li>a</li><ol><li>b</li></ol></ul>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click numlist button', 'button[aria-label="Numbered list"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ]),
      Log.stepsAsStep('TBA', 'Lists: ol to ul, cursor only in parent', [
        tinyApis.sSetContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li>a</li><ol><li>b</li></ol></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Lists: ol to ul, selection from parent to sublist', [
        tinyApis.sSetContent('<ol><li>a</li><ul><li>b</li></ul></ol>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ]),
      Log.stepsAsStep('TBA', 'Lists: alpha to ol, cursor only in parent', [
        tinyApis.sSetContent('<ul style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Numbered list"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Lists: alpha to ol, selection from parent to sublist', [
        tinyApis.sSetContent('<ul style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Numbered list"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ]),
      Log.stepsAsStep('TBA', 'Lists: alpha to ul, cursor only in parent', [
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ]),
      Log.stepsAsStep('TBA', 'Lists: alpha to ul, selection from parent to sublist', [
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click bullist button', 'button[aria-label="Bullet list"]'),
        tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ])
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
