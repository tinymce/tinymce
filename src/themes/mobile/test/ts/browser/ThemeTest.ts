import { Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Styles from 'tinymce/themes/mobile/style/Styles';
import mobileTheme from 'tinymce/themes/mobile/Theme';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.core.ThemeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  mobileTheme();
  ImagePlugin();
  TablePlugin();
  LinkPlugin();
  PastePlugin();
  ContextMenuPlugin();
  TextPatternPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const ui = TinyUi(editor);

    Pipeline.async({}, [
      UiFinder.sExists(Element.fromDom(document.body), `.${Styles.resolve('mask-tap-icon')}`),
      ui.sClickOnUi('Click the tap to edit button', `.${Styles.resolve('mask-tap-icon')}`),
      ui.sWaitForUi('Wait mobile Toolbar', `.${Styles.resolve('toolbar')}`),
      ui.sWaitForUi('Check for The first group', '[aria-label="The first group"]'),
      ui.sWaitForUi('Check for the action group', '[aria-label="the action group"]'),
      UiFinder.sNotExists(Element.fromDom(document.body), '[aria-label="The read only mode group"]'),
      UiFinder.sNotExists(Element.fromDom(document.body), `.${Styles.resolve('mask-edit-icon')}`),
      ui.sClickOnUi('Click back to Tap to Edit screen', `.${Styles.resolve('icon-back')}`),
      UiFinder.sExists(Element.fromDom(document.body), `.${Styles.resolve('mask-tap-icon')}`),
    ], onSuccess, onFailure);
  }, {
    theme: 'mobile',
    plugins: 'image table link paste contextmenu textpattern',
    insert_toolbar: 'quickimage media quicktable',
    selection_toolbar: 'bold italic | quicklink h1 h2 blockquote',
    inline: false,
    skin_url: '/project/js/tinymce/skins/lightgray'

  }, success, failure);
});
