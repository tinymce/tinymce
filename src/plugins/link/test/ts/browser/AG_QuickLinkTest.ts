import '../../../../../themes/silver/main/ts/Theme';

import { FocusTools, Keyboard, Keys, Log, Pipeline, Step, GeneralSteps, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';
import { Body } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.link.QuickLinkTest', (success, failure) => {

  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const doc = TinyDom.fromDom(document);

    const sOpenQuickLink = GeneralSteps.sequence([
      Step.sync(() => {
        editor.execCommand('mceLink');
      }),
      FocusTools.sTryOnSelector('Selector should be in contextform input', doc, '.tox-toolbar input'),
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Checking that QuickLink can insert a link', [
        TestLinkUi.sClearHistory,
        tinyApis.sFocus,
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

      Log.stepsAsStep('TBA', 'Checking that QuickLink can edit and existing link', [
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
        tinyApis.sSetSelection([ 0, 0, 0 ], 'W'.length, [ 0, 0, 0 ], 'W'.length),
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
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});
