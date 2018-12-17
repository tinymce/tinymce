import { Pipeline, Log, FocusTools, Keyboard, Keys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import Theme from '../../../../../themes/silver/main/ts/Theme';
import HelpPlugin from 'tinymce/plugins/help/Plugin';
// TODO immediately
import { addLogEntry } from '@ephox/agar/lib/main/ts/ephox/agar/api/TestLogs';

UnitTest.asynctest('browser.tinymce.plugins.help.DialogKeyboardNavTest', (success, failure) => {

  HelpPlugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = Element.fromDom(document);

    // Tab key press
    const sPressTabKey = Keyboard.sKeydown(doc, Keys.tab(), { });

    // Down arrow key press to nav between tabs
    const sPressDownArrowKey = Keyboard.sKeydown(doc, Keys.down(), { });

    // Assert focus is on the expected form element
    const sAssertFocusOnItem = (label, selector) => {
      return FocusTools.sTryOnSelector(
        `Focus should be on: ${label}`,
        doc,
        selector
      );
    };

    Pipeline.async({}, [
      Step.raw((value, next, die, logs) => {
        const newLogs = addLogEntry(logs, 'Current focus: ' + (document.activeElement ? document.activeElement.nodeName : 'none'));
        next(value, newLogs);
      }),
      Log.stepsAsStep('TBA', 'Help: Open dialog', [
        tinyApis.sFocus,
        tinyApis.sExecCommand('mceHelp')
      ]),

      Log.stepsAsStep('TBA', 'Help: test the tab key navigation cycles through all focusable fields in Handy Shortcuts tab', [
        sAssertFocusOnItem('Handy Shortcuts Tab', '.tox-dialog__body-nav-item:contains("Handy Shortcuts")'),
        sPressTabKey,
        sAssertFocusOnItem('Handy Shortcuts Items', '.tox-dialog__table'),
        sPressTabKey,
        sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
        sPressTabKey,
        sAssertFocusOnItem('Handy Shortcuts Tab', '.tox-dialog__body-nav-item:contains("Handy Shortcuts")'),
        sPressDownArrowKey
      ]),

      Log.stepsAsStep('TBA', 'Help: test the tab key navigation cycles through all focusable fields in Plugins tab', [
        sAssertFocusOnItem('Plugins Tab', '.tox-dialog__body-nav-item:contains("Plugins")'),
        sPressTabKey,
        sAssertFocusOnItem('Installed Plugins', 'div[role="presentation"]'),
        sPressTabKey,
        sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
        sPressTabKey,
        sAssertFocusOnItem('Plugins Tab', '.tox-dialog__body-nav-item:contains("Plugins")'),
        sPressDownArrowKey
      ]),

      Log.stepsAsStep('TBA', 'Help: test the tab key navigation cycles through all focusable fields in Version tab', [
        sAssertFocusOnItem('Version Tab', '.tox-dialog__body-nav-item:contains("Version")'),
        sPressTabKey,
        sAssertFocusOnItem('TinyMCE Version', 'div[role="presentation"]'),
        sPressTabKey,
        sAssertFocusOnItem('Close Button', '.tox-button:contains("Close")'),
        sPressTabKey,
        sAssertFocusOnItem('Version Tab', '.tox-dialog__body-nav-item:contains("Version")')
      ])
    ], onSuccess, onFailure);
  }, {
      plugins: 'help',
      toolbar: 'help',
      theme: 'silver',
      skin_url: '/project/js/tinymce/skins/oxide'
    }, success, failure);
});