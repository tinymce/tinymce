import { Chain, Keys, Pipeline, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import InliteTheme from 'tinymce/themes/inlite/Theme';

import Toolbar from '../module/test/Toolbar';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('browser.ClosedDialogScrollTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  InliteTheme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    Pipeline.async({}, [
      tinyApis.sFocus,
      tinyApis.sSetContent('<p style="height: 5000px">a</p><p>b</p>'),
      tinyApis.sSetSelection([1], 0, [1], 1),
      tinyActions.sContentKeystroke(Keys.space(), {}),
      Chain.asStep({}, [
        Toolbar.cWaitForToolbar,
        Toolbar.cClickButton('Insert/Edit link')
      ]),
      tinyActions.sUiKeydown(Keys.enter(), {}),
      Step.sync(function () {
        const offset = window.pageYOffset;

        RawAssertions.assertEq('Should not be at top', offset > 0, true);
      })
    ], onSuccess, onFailure);
  }, {
    theme: 'inlite',
    plugins: 'link',
    insert_toolbar: 'quickimage media quicktable',
    selection_toolbar: 'bold italic | quicklink h1 h2 blockquote',
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
