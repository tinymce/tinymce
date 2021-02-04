import { Assertions, Chain, Log, Mouse, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.link.RemoveLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = TinyDom.fromDom(document);
    const body = SugarElement.fromDom(editor.getBody());

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Enable Removing link after double click', [
        tinyApis.sSetSetting('link_context_toolbar', true),
        tinyApis.sSetContent('<a href="http://www.google.com/">test</a>'),
        Mouse.sTrueDoubleClickOn(body, 'a'),
        tinyUi.sWaitForUi('Check the link button is enabled', 'button[aria-label="Remove link"]:not(.tox-tbtn--disabled)')
      ]),
      Log.stepsAsStep('TBA', 'Removing a link with a collapsed selection', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud">tiny</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 2, [ 0, 0, 0 ], 2),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body)
      ]),
      Log.stepsAsStep('TBA', 'Removing a link with some text selected', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud">tiny</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body)
      ]),
      Log.stepsAsStep('TBA', 'Removing a link from an image', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud"><img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png" /></a></p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        Chain.asStep(doc, [
          tinyUi.cTriggerContextMenu('open context menu', 'a[href="http://tiny.cloud"]', '.tox-silver-sink [role="menuitem"]')
        ]),
        tinyUi.sClickOnUi('Click unlink', 'div[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { 'a[href="http://tiny.cloud"]': 0 }, body)
      ]),
      Log.stepsAsStep('TINY-4867', 'Removing multiple links in the selection', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud">tiny</a> content <a href="http://tiny.cloud">link</a> with <a href="http://tiny.cloud">other</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 4, 0 ], 2),
        tinyUi.sClickOnToolbar('Click unlink', 'button[title="Remove link"]'),
        Assertions.sAssertPresence('Assert entire link removed', { a: 0 }, body),
        tinyApis.sAssertSelection([ 0, 0 ], 1, [ 0, 4 ], 2)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'unlink',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
