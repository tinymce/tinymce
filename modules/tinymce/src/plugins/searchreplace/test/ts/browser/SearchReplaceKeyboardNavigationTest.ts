import { Chain, FocusTools, GeneralSteps, Keyboard, Keys, Log, Logger, Pipeline, Step, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import Tools from 'tinymce/core/api/util/Tools';
import SearchReplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplaceKeyboardNavigationTest', function (success, failure) {
  SilverTheme();
  SearchReplacePlugin();

  const sOpenDialog = (ui: TinyUi) => Logger.t('Open dialog', GeneralSteps.sequence([
    ui.sClickOnToolbar('Click on find and replace button, there should be only 1 button in the toolbar', 'div.tox-toolbar__group > button'),
    ui.sWaitForPopup('wait for dialog', 'div.tox-dialog')
  ]));

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);
    const body = Element.fromDom(document.body);

    const sPressTab = Keyboard.sKeydown(doc, Keys.tab(), {});
    const sPressEsc = Keyboard.sKeydown(doc, Keys.escape(), {});
    const sPressDown = Keyboard.sKeydown(doc, Keys.down(), {});
    const sPressRight = Keyboard.sKeydown(doc, Keys.right(), {});
    const sPressEnter = Keyboard.sKeydown(doc, Keys.enter(), {});

    const sFocusToolbar = Step.sync(() => {
      const args = Tools.extend({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false
      }, { altKey: true, keyCode: 120 });
      editor.fire('keydown', args);
    });

    const sAssertFocused = (name, selector) => FocusTools.sTryOnSelector(name, doc, selector);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-3914', 'Find and replace: Reaching find and replace via the keyboard', [
        sFocusToolbar,
        sAssertFocused('File', '.tox-mbtn:contains("File")'),
        sPressRight,
        sAssertFocused('Edit', '.tox-mbtn:contains("Edit")'),
        sPressDown, // select all
        tinyUi.sWaitForPopup('Wait for menu to open', '.tox-menu'),
        sPressDown, // find and replace
        sAssertFocused('Find and replace edit menu item', '.tox-collection__item:contains("Find and replace")'), // Menu item can be reached by keyboard
        sPressEsc,
        sPressTab,
        sAssertFocused('Find and replace button', '.tox-tbtn') // Button can be reached by keyboard
      ]),
      Log.stepsAsStep('TINY-3914', 'Find and replace: Dialog keyboard navigation', [
        sOpenDialog(tinyUi),
        sAssertFocused('Find input', '.tox-textfield[placeholder="Find"]'),
        sPressTab,
        sAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]'),
        sPressTab,
        sAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]'),
        sPressDown,
        sAssertFocused('Match case menu item', '.tox-collection__item:contains("Match case")'), // Menu items can be reached by keyboard
        sPressEnter,
        sAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]'),
        sPressTab,
        sAssertFocused('Find button', '.tox-button[title="Find"]'),
        sPressEsc
      ]),
      Log.stepsAsStep('TINY-3961', 'Find and replace: Dialog keyboard focus is returned to find input', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        sOpenDialog(tinyUi),
        sAssertFocused('Find input', '.tox-textfield[placeholder="Find"]'),
        sPressTab,
        sAssertFocused('Replace with input', '.tox-textfield[placeholder="Replace with"]'),
        sPressTab,
        sAssertFocused('Placeholder menu button', '.tox-tbtn--select[title="Preferences"]'),
        sPressTab,
        sAssertFocused('Find button', '.tox-button[title="Find"]'),
        Chain.asStep(body, [
          UiFinder.cFindIn('input.tox-textfield[placeholder="Find"]'),
          UiControls.cSetValue('fish')
        ]),
        sPressEnter,
        sPressTab,
        sAssertFocused('Find button', '.tox-button[title="Replace"]'),
        sPressTab,
        sAssertFocused('Find button', '.tox-button[title="Replace All"]'),
        sPressEnter,
        sAssertFocused('Find input', '.tox-textfield[placeholder="Find"]'),
        sPressEsc
      ]),
      Log.stepsAsStep('TINY-4014', 'Find and replace: Dialog keyboard focus is returned to find input after displaying an alert', [
        tinyApis.sSetContent('<p>fish fish fish</p>'),
        sOpenDialog(tinyUi),
        sAssertFocused('Find input', '.tox-textfield[placeholder="Find"]'),
        Chain.asStep(body, [
          UiFinder.cFindIn('input.tox-textfield[placeholder="Find"]'),
          UiControls.cSetValue('notfound')
        ]),
        sPressEnter,
        sAssertFocused('Alert dialog OK button', '.tox-alert-dialog .tox-button[title="OK"]'),
        sPressEnter,
        sAssertFocused('Find input', '.tox-textfield[placeholder="Find"]'),
        sPressEsc
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    menubar: 'file edit',
    menu: {
      file: { title: 'File', items: 'newdocument' },
      edit: { title: 'Edit', items: 'selectall searchreplace' }
    }
  }, success, failure);
});
