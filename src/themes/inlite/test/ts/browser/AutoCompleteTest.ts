import {
    Chain, FocusTools, GeneralSteps, Keyboard, Keys, Pipeline, UiControls, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/inlite/Theme';

import Toolbar from '../module/test/Toolbar';
import { document } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('browser.AutoCompleteTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ImagePlugin();
  LinkPlugin();
  PastePlugin();
  ContextMenuPlugin();
  TablePlugin();
  TextpatternPlugin();
  Theme();

  const cKeyStroke = function (keyvalue, modifiers) {
    return Chain.op(function (dispatcher: Element) {
      Keyboard.keystroke(keyvalue, modifiers, dispatcher);
    });
  };

  const sSetupLinkableContent = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent(
        '<h1 id="a">abc</h1>' +
        '<h2 id="b">abcd</h2>' +
        '<h3 id="c">abce</h3>'
      ),
      tinyApis.sSetSelection([0, 0], 0, [0, 0], 1)
    ]);
  };

  const sSelectAutoCompleteLink = function (tinyApis, url) {
    return Chain.asStep({}, [
      Chain.fromParent(Toolbar.cWaitForToolbar, [
        Toolbar.cClickButton('Insert/Edit link')
      ]),
      Chain.fromParent(UiFinder.cFindIn('input'), [
        UiControls.cSetValue(url),
        cKeyStroke(Keys.space(), {}),
        cKeyStroke(Keys.down(), {})
      ]),
      Chain.inject(TinyDom.fromDom(document)),
      Chain.fromParent(FocusTools.cGetFocused, [
        cKeyStroke(Keys.down(), {}),
        cKeyStroke(Keys.enter(), {})
      ]),
      Chain.fromParent(Toolbar.cWaitForToolbar, [
        Toolbar.cClickButton('Ok')
      ])
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sSetupLinkableContent(tinyApis),
      tinyActions.sContentKeystroke(Keys.space(), {}),
      sSelectAutoCompleteLink(tinyApis, 'a'),
      tinyApis.sAssertContent(
        '<h1 id="a"><a href="#b">a</a>bc</h1>\n' +
        '<h2 id="b">abcd</h2>\n' +
        '<h3 id="c">abce</h3>'
      )
    ], onSuccess, onFailure);
  }, {
    theme: 'inlite',
    plugins: 'image table link paste contextmenu textpattern',
    insert_toolbar: 'quickimage media quicktable',
    selection_toolbar: 'bold italic | quicklink h1 h2 blockquote',
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
