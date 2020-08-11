import { Chain, FocusTools, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.SelectedImageTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = TinyDom.fromDom(document);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TBA', 'Link: images should be preserved when adding a link', [
        tinyApis.sSetContent('<p><img src="image.png"></p>'),
        tinyApis.sSelect('img', []),
        TestLinkUi.sOpenLinkDialog(tinyUi),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        UiFinder.sNotExists(Body.body(), '.tox-label:contains("Text to display")'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'img[src="image.png"]': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TBA', 'Link: images should be preserved when editing a link', [
        tinyApis.sSetContent('<p><a href="http://www.google.com/"><img src="image.png"></a></p>'),
        tinyApis.sSelect('a', []),
        TestLinkUi.sOpenLinkDialog(tinyUi),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        UiFinder.sNotExists(Body.body(), '.tox-label:contains("Text to display")'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is updated',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'img[src="image.png"]': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TINY-4706', 'Link: images link urls should be able to be removed', [
        tinyApis.sSetContent('<p><a href="http://www.google.com/" title="test"><img src="image.png"></a></p>'),
        tinyApis.sSelect('a', []),
        TestLinkUi.sOpenLinkDialog(tinyUi),
        Chain.asStep(Body.body(), [
          FocusTools.cSetActiveValue(''),
          TestLinkUi.cFireEvent('input')
        ]),
        UiFinder.sNotExists(Body.body(), '.tox-label:contains("Text to display")'),
        TestLinkUi.sAssertDialogContents({
          url: '',
          title: 'test'
        }),
        TestLinkUi.sClickCancel
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
