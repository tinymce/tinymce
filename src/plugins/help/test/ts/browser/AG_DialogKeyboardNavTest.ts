import { Pipeline, Log, FocusTools, Keyboard, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import Theme from '../../../../../themes/silver/main/ts/Theme';
import HelpPlugin from 'tinymce/plugins/help/Plugin';

UnitTest.asynctest('browser.tinymce.plugins.help.DialogKeyboardNavTest', (success, failure) => {

  HelpPlugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = Element.fromDom(document);

    // Tab key press
    const sPressTabKey = Keyboard.sKeydown(doc, Keys.tab(), { });

    // Assert focus is on the expected form element
    const sAssertFocusOnItem = (label, selector) => {
      return FocusTools.sTryOnSelector(
        `Focus should be on: ${label}`,
        doc,
        selector
      );
    };

    Pipeline.async({}, Log.steps('TBA', 'Help: Open dialog, test the tab key navigation cycles through all focusable fields in Handy Shortcuts, Plugins and Version tab', [
      // Open help dialog
      tinyApis.sExecCommand('mceHelp'),

      // Keyboard nav within the Handy Shortcuts tab
      sAssertFocusOnItem('Handy Shortcuts Tab', '.tox-dialog__body-nav-item:contains("Handy Shortcuts")'),
      sPressTabKey,
      sAssertFocusOnItem('Handy Shortcuts Items', 'div[role="presentation"]'),
      sPressTabKey,
      sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
      sPressTabKey,
      sAssertFocusOnItem('Handy Shortcuts Tab', '.tox-dialog__body-nav-item:contains("Handy Shortcuts")'),

      // Press arrow keys to nav between tabs
      Keyboard.sKeydown(doc, Keys.down(), { }),

      // Keyboard nav within the Plugins tab
      sAssertFocusOnItem('Plugins Tab', '.tox-dialog__body-nav-item:contains("Plugins")'),
      sPressTabKey,
      sAssertFocusOnItem('Installed Plugins', 'div[role="presentation"]'),
      sPressTabKey,
      sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
      sPressTabKey,
      sAssertFocusOnItem('Plugins Tab', '.tox-dialog__body-nav-item:contains("Plugins")'),

      // Press arrow keys to nav between tabs
      Keyboard.sKeydown(doc, Keys.down(), { }),

      // Keyboard nav within the Version tab
      sAssertFocusOnItem('Version Tab', '.tox-dialog__body-nav-item:contains("Version")'),
      sPressTabKey,
      sAssertFocusOnItem('TinyMCE Version', 'div[role="presentation"]'),
      sPressTabKey,
      sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
      sPressTabKey,
      sAssertFocusOnItem('Version Tab', '.tox-dialog__body-nav-item:contains("Version")')
    ]), onSuccess, onFailure);
  }, {
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide'
    }, success, failure);
});