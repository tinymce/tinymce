import { Assertions, Chain, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.link.RemoveLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = TinyDom.fromDom(document);
    const body = Element.fromDom(editor.getBody());

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Removing a link with a collapsed selection', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud">tiny</a></p>'),
        tinyApis.sSetSelection([0, 0, 0], 2, [0, 0, 0], 2),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body),
      ]),
      Log.stepsAsStep('TBA', 'Removing a link with some text selected', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud">tiny</a></p>'),
        tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 2),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body),
      ]),
      Log.stepsAsStep('TBA', 'Removing a link from an image', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud"><img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png" /></a></p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body),
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'unlink',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
