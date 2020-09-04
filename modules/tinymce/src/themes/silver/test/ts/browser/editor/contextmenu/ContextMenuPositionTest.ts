import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { sAssertContentMenuPosition, sOpenContextMenu } from '../../../module/ContextMenuUtils';

UnitTest.asynctest('browser.tinymce.themes.silver.editor.contextmenu.ContextMenuPositionTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-6036', 'Context menu opened on node should open at right click position', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> content</p>'),
        tinyApis.sSetCursor([ 0, 1, 0 ], 0),
        sOpenContextMenu(tinyUi, editor, 'strong'), // Will trigger from the top right corner of the node
        sAssertContentMenuPosition(61, -182)
      ]),
      Log.stepsAsStep('TINY-6036', 'Context menu opened on "overlap avoid" element should dock to node', [
        tinyApis.sSetContent('<p>Some <span class="mce-spellchecker-word">invalud</span> word</p>'),
        tinyApis.sSetCursor([ 0, 1, 0 ], 0),
        sOpenContextMenu(tinyUi, editor, 'span.mce-spellchecker-word'),
        sAssertContentMenuPosition(61, -163)
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'link',
    indent: false,
    height: 200,
    base_url: '/project/tinymce/js/tinymce',
    contextmenu_avoid_overlap: '.mce-spellchecker-word'
  }, success, failure);
});
