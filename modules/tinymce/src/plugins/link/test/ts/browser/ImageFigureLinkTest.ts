import { Assertions, Log, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import * as LinkPluginUtils from 'tinymce/plugins/link/core/Utils';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.ImageFigureLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    const sLinkTheSelection = function () {
      return Logger.t('Link the selection', TestLinkUi.sInsertLink(ui, 'http://google.com'));
    };

    const sUnlinkSelection = function () {
      return Logger.t('Unlink the selection', Step.sync(function () {
        LinkPluginUtils.unlink(editor);
      }));
    };

    const sAssertPresence = function (selector: Record<string, number>) {
      return Waiter.sTryUntil('Assert element is present',
        Assertions.sAssertPresence('Detect presence of the element', selector, TinyDom.fromDom(editor.getBody()))
      );
    };

    Pipeline.async({},
      Log.steps('TBA', 'Link: Set content, select and link the selection, assert link is present. Then select and unlink the selection, assert link is not present', [
        TestLinkUi.sClearHistory,
        api.sSetContent(
          '<figure class="image">' +
            '<img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png" />' +
            '<figcaption>TinyMCE</figcaption>' +
          '</figure>'
        ),
        api.sSetSelection([ 0 ], 0, [ 0 ], 0),
        sLinkTheSelection(),
        sAssertPresence({ 'figure.image > a[href="http://google.com"] > img': 1 }),

        api.sSetSelection([ 0 ], 0, [ 0 ], 0),
        sUnlinkSelection(),
        sAssertPresence({ 'figure.image > img': 1 }),
        TestLinkUi.sClearHistory
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
