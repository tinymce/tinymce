import { Chain, FocusTools, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Document } from '@ephox/sugar';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.AnchorFalseTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Document.getDocument();

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Step.sync(() => {
        LocalStorage.setItem('tinymce-url-history', JSON.stringify({
          file: [ 'http://www.tiny.cloud/' ]
        }));
      }),
      Log.stepsAsStep('TINY-6256', 'With anchor top/bottom set to false, they shouldn\'t be shown in the url list options', [
        TestLinkUi.sOpenLinkDialog(tinyUi),
        FocusTools.sSetActiveValue(doc, 't'),
        Chain.asStep(doc, [
          FocusTools.cGetFocused,
          TestLinkUi.cFireEvent('input')
        ]),
        tinyUi.sWaitForUi('Wait for the typeahead to open', '.tox-dialog__popups .tox-menu'),
        UiFinder.sNotExists(Body.body(), '.tox-dialog__popups .tox-menu .tox-collection__item:contains(<top>)'),
        UiFinder.sNotExists(Body.body(), '.tox-dialog__popups .tox-menu .tox-collection__item:contains(<bottom>)')
      ]),
      Step.sync(() => {
        LocalStorage.removeItem('tinymce-url-history');
      })
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'link',
    toolbar: 'link',
    menubar: false,
    base_url: '/project/tinymce/js/tinymce',
    anchor_top: false,
    anchor_bottom: false
  }, success, failure);
});
