import { FocusTools, GeneralSteps, Keyboard, Keys, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.QuickLinkTest', (success, failure) => {
  SilverTheme();
  LinkPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    const sOpenQuickLink = GeneralSteps.sequence([
      Step.sync(() => {
        editor.execCommand('mceLink');
      }),
      // tests were erronously allowed to pass when the quick link dialog would
      // open and very quickly close because this was happing at superhuman
      // speeds. So I'm slowing it down.
      Step.wait(500),
      FocusTools.sTryOnSelector('Selector should be in contextform input', doc, '.tox-toolbar input'),
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      TestLinkUi.sClearHistory,

      Log.stepsAsStep('TBA', 'Checking that QuickLink can insert a link', [
        sOpenQuickLink,
        FocusTools.sSetActiveValue(doc, 'http://tiny.cloud'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tinyApis.sAssertContentPresence({
          'a[href="http://tiny.cloud"]': 1,
          'a:contains("http://tiny.cloud")': 1
        }),
        UiFinder.sNotExists(Body.body(), '.tox-pop__dialog')
      ]),

      Log.stepsAsStep('TBA', 'Checking that QuickLink can add a link to selected text and keep the current text', [
        tinyApis.sSetContent('<p>Word</p>'),
        tinyApis.sSetSelection([ 0, 0 ], ''.length, [ 0, 0 ], 'Word'.length),
        sOpenQuickLink,
        FocusTools.sSetActiveValue(doc, 'http://tiny.cloud/2'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tinyApis.sAssertContentPresence({
          'a[href="http://tiny.cloud/2"]': 1,
          'a:contains("http://tiny.cloud/2")': 0,
          'a:contains("Word")': 1
        }),
        UiFinder.sNotExists(Body.body(), '.tox-pop__dialog')
      ]),

      Log.stepsAsStep('TBA', 'Checking that QuickLink can add a link to a selected image and keep the current image', [
        tinyApis.sSetContent('<p><img src="image.jpg"></p>'),
        tinyApis.sSelect('img', []),
        sOpenQuickLink,
        FocusTools.sSetActiveValue(doc, 'http://tiny.cloud/2'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tinyApis.sAssertContentPresence({
          'a[href="http://tiny.cloud/2"]': 1,
          'a:contains("http://tiny.cloud/2")': 0,
          'img[src="image.jpg"]': 1
        }),
        UiFinder.sNotExists(Body.body(), '.tox-pop__dialog')
      ]),

      Log.stepsAsStep('TBA', 'Checking that QuickLink can edit an existing link', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud/3">Word</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 'W'.length, [ 0, 0, 0 ], 'Wo'.length),
        sOpenQuickLink,
        FocusTools.sSetActiveValue(doc, 'http://tiny.cloud/changed/3'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tinyApis.sAssertContentPresence({
          'a[href="http://tiny.cloud/changed/3"]': 1,
          'a:contains("http://tiny.cloud/3")': 0,
          'a:contains("Word")': 1
        }),
        UiFinder.sNotExists(Body.body(), '.tox-pop__dialog')
      ]),

      Log.stepsAsStep('TBA', 'Checking that QuickLink can remove an existing link', [
        tinyApis.sSetContent('<p><a href="http://tiny.cloud/4">Word</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 'Wor'.length, [ 0, 0, 0 ], 'Wor'.length),
        // TODO FIXME TINY-2691
        // Note the following assert fails on IE
        // tinyApis.sAssertSelection([ 0, 0, 0 ], 'Wor'.length, [ 0, 0, 0 ], 'Wor'.length),
        sOpenQuickLink,
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        tinyApis.sAssertContentPresence({
          'a': 0,
          'p:contains("Word")': 1
        }),
        UiFinder.sNotExists(Body.body(), '.tox-pop__dialog')
      ]),

      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    link_quicklink: true,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
