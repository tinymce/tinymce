import { Pipeline, Log, Waiter, UiFinder, Keyboard, Keys, GeneralSteps, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi, TinyDom } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.preview.PreviewSanityTest', (success, failure) => {

  PreviewPlugin();
  SilverTheme();

  const dialogSelector = 'div[role="dialog"]';
  const docBody = Element.fromDom(document.body);
  const doc = TinyDom.fromDom(document);

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sOpenDialog = () => {
      return GeneralSteps.sequence(Logger.ts('Open dialog and wait for it to be visible', [
        tinyUi.sClickOnToolbar('click on preview toolbar', 'button'),
        tinyUi.sWaitForPopup('wait for preview popup', '[role="dialog"] iframe')
      ]));
    };

    Pipeline.async({},
      Log.steps('TBA', 'Preview: Set content, open dialog, click Close to close dialog. Open dialog, press escape and assert dialog closes', [
        tinyApis.sSetContent('<strong>a</strong>'),

        sOpenDialog(),
        tinyUi.sClickOnUi('Click on Close button', '.tox-button:not(.tox-button--secondary)'),
        Waiter.sTryUntil('Dialog should close', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000),

        sOpenDialog(),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Waiter.sTryUntil('Dialog should close on esc', UiFinder.sNotExists(docBody, dialogSelector), 100, 3000)
      ])
    , onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'preview',
    toolbar: 'preview',
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
