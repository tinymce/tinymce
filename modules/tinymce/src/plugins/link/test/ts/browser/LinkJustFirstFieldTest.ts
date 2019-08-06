import { Chain, FocusTools, Keyboard, Keys, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.JustFirstFieldTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TBA', 'Checking only choosing link and submitting works', [
        Step.sync(() => {
          editor.execCommand('mceLink');
        }),
        UiFinder.sWaitForVisible('wait for link dialog', TinyDom.fromDom(document.body), '[role="dialog"]'),
        FocusTools.sTryOnSelector('Selector should be in first field of dialog', doc, '.tox-dialog input'),
        FocusTools.sSetActiveValue(doc, 'http://goo'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          TestLinkUi.cFireEvent('input')
        ]),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Waiting for link to be inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://goo"]': 1
          }),
          100,
          1000
        )
      ]),
      TestLinkUi.sClearHistory,
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
