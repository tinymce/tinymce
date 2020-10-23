import { FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.SelectedTextTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    const sTextToDisplayShown = UiFinder.sExists(SugarBody.body(), '.tox-label:contains("Text to display")');
    const sTextToDisplayHidden = UiFinder.sNotExists(SugarBody.body(), '.tox-label:contains("Text to display")');

    const sOpenDialog = (textToDisplayVisible: boolean = true) => GeneralSteps.sequence([
      tinyApis.sExecCommand('mcelink'),
      UiFinder.sWaitForVisible('wait for link dialog', TinyDom.fromDom(document.body), '[role="dialog"]'),
      textToDisplayVisible ? sTextToDisplayShown : sTextToDisplayHidden
    ]);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TINY-5205', 'Link: basic text selection with existing link should preserve the text when changing URL', [
        tinyApis.sSetContent('<p><a href="http://oldlink/">word</a></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'p:contains(word)': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TBA', 'Link: complex selections across paragraphs should preserve the text', [
        tinyApis.sSetContent('<p><strong>word</strong></p><p><strong>other</strong></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 1 ], 1),
        sOpenDialog(false),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 2,
            'p:contains(word)': 1,
            'p:contains(other)': 1,
            'p': 2
          })
        )
      ]),
      Log.stepsAsStep('TINY-5205', 'Link: complex selections with existing link should preserve the text when changing URL', [
        tinyApis.sSetContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'strong:contains(word)': 1,
            'em:contains(other)': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TINY-5205', 'Link: complex selections with existing link should replace the text when changing text', [
        tinyApis.sSetContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sSetActiveValue(doc, 'new text'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'a:contains(new text)': 1,
            'strong': 0,
            'em': 0,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TINY-5205', 'Link: collapsed selection in complex structure should preserve the text when changing URL', [
        tinyApis.sSetContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0, 0 ], 2, [ 0, 0, 0, 0 ], 2),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is inserted',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'strong:contains(word)': 1,
            'em:contains(other)': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TINY-5205', 'Link: Selection with link inside should replace link', [
        tinyApis.sSetContent('<p>a <a href="http://www.google.com/">b</a> c</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 2 ], 2),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is updated',
          tinyApis.sAssertContentPresence({
            'a[href="http://something"]': 1,
            'a': 1,
            'p': 1
          })
        )
      ]),
      Log.stepsAsStep('TINY-5205', 'Link: Selection across partial link should split and replace link', [
        tinyApis.sSetContent('<p><a href="http://www.google.com/">a b</a> c</p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 2, [ 0, 1 ], 2),
        sOpenDialog(),
        FocusTools.sSetActiveValue(doc, 'http://something'),
        TestLinkUi.sClickSave,
        Waiter.sTryUntil(
          'Wait until link is updated',
          tinyApis.sAssertContentPresence({
            'a[href="http://www.google.com/"]': 1,
            'a[href="http://something"]': 1,
            'a': 2,
            'p': 1
          })
        )
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: '',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      // Simulate comments being enabled
      editor.on('GetContent', (e) => {
        if (e.selection) {
          e.content += '<!-- TinyComments -->';
        }
      });
    }
  }, success, failure);
});
