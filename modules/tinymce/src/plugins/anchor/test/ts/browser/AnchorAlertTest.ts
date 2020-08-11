import { Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { sAddAnchor } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.anchor.AnchorAlertTest', (success, failure) => {
  AnchorPlugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    const docBody = Element.fromDom(document.body);
    const dialogSelector = 'div[role="dialog"].tox-dialog';
    const alertDialogSelector = 'div[role="dialog"].tox-dialog.tox-alert-dialog';

    Pipeline.async({},
      Log.steps('TINY-2788', 'Anchor: Add anchor with invalid id, check alert appears', [
        tinyApis.sSetContent(''),
        sAddAnchor(tinyApis, tinyUi, ''),
        tinyUi.sWaitForPopup('Wait for alert window', alertDialogSelector),
        tinyUi.sClickOnUi('Click on OK button', 'button.tox-button:contains(OK)'),
        Waiter.sTryUntil('Alert dialog should close', UiFinder.sNotExists(docBody, alertDialogSelector)),
        Waiter.sTryUntil('Anchor Dialog should not close', UiFinder.sExists(docBody, dialogSelector)),
        tinyUi.sClickOnUi('Click on Cancel button', 'button.tox-button:contains(Cancel)'),
        Waiter.sTryUntil('Anchor Dialog should close', UiFinder.sNotExists(docBody, dialogSelector)),
        tinyApis.sAssertContent('')
      ]), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
