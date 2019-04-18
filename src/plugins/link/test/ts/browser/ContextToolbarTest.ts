import { Chain, Log, Mouse, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.ContextToolbarTest', (success, failure) => {
  Theme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const editorEle = TinyDom.fromDom(editor.getBody());
    const docEle = TinyDom.fromDom(document.body);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'no toolbar on by default', [
        tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
        Mouse.sTrueClickOn(editorEle, 'a'),
        UiFinder.sNotExists(editorEle, '.tox-toolbar button[aria-label="Link"]'),
        tinyApis.sSetContent('')
      ]),
      Log.stepsAsStep('TBA', 'only after setting set to true', [
        tinyApis.sSetSetting('link_context_toolbar', true),
        tinyApis.sSetContent('<a href="http://www.google.com">google</a>'),
        Mouse.sTrueClickOn(editorEle, 'a'),
        tinyUi.sWaitForUi('wait for toolbar link button', '.tox-toolbar button[aria-label="Link"]'),
        tinyUi.sWaitForUi('wait for toolbar unlink button', '.tox-toolbar button[aria-label="Remove link"]'),
        tinyUi.sWaitForUi('wait for toolbar open link button', '.tox-toolbar button[aria-label="Open link"]'),
        Chain.asStep(docEle, [
          UiFinder.cWaitForState('check link content', '.tox-toolbar input', (ele) => ele.dom().value === 'http://www.google.com')
        ])
      ]),
      Log.stepsAsStep('TBA', 'shows relative link urls', [
        tinyApis.sSetSetting('link_context_toolbar', true),
        tinyApis.sSetContent('<a href="#heading-1">heading</a>'),
        Mouse.sTrueClickOn(editorEle, 'a'),
        tinyUi.sWaitForUi('wait for toolbar link button', '.tox-toolbar button[aria-label="Link"]'),
        Chain.asStep(docEle, [
          UiFinder.cWaitForState('check link content', '.tox-toolbar input', (ele) => ele.dom().value === '#heading-1')
        ])
      ]),
      Log.stepsAsStep('TBA', 'works with non text elements (e.g. images)', [
        tinyApis.sSetSetting('link_context_toolbar', true),
        tinyApis.sSetContent('<a href="http://www.google.com/"><img src="image.jpg"></a>'),
        Mouse.sTrueClickOn(editorEle, 'a'),
        tinyUi.sWaitForUi('wait for toolbar link button', '.tox-toolbar button[aria-label="Link"]'),
        Chain.asStep(docEle, [
          UiFinder.cWaitForState('check link content', '.tox-toolbar input', (ele) => ele.dom().value === 'http://www.google.com/')
        ])
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
