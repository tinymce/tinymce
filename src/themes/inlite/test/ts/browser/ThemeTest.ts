import {
    Chain, FocusTools, GeneralSteps, Keys, Mouse, Pipeline, UiControls, UiFinder, Waiter
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyDom, TinyLoader } from '@ephox/mcagar';

import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import InliteTheme from 'tinymce/themes/inlite/Theme';

import Toolbar from '../module/test/Toolbar';

UnitTest.asynctest('browser.core.ThemeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const dialogRoot = TinyDom.fromDom(document.body);

  InliteTheme();
  ImagePlugin();
  TablePlugin();
  LinkPlugin();
  PastePlugin();
  ContextMenuPlugin();
  TextPatternPlugin();

  const sClickFocusedButton = function (selector) {
    return GeneralSteps.sequence([
      Waiter.sTryUntil(
        'Focus was not moved to the expected element',
        FocusTools.sIsOnSelector('Is not on the right element', TinyDom.fromDom(document), selector),
        10,
        1000
      ),
      Chain.asStep(TinyDom.fromDom(document), [
        FocusTools.cGetFocused,
        Mouse.cTrueClick
      ])
    ]);
  };

  const sBoldTests = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p>a</p>'),
      tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
      Toolbar.sClickButton('Bold'),
      tinyApis.sAssertContent('<p><strong>a</strong></p>')
    ]);
  };

  const sH2Tests = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p>a</p>'),
      tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
      Toolbar.sClickButton('Heading 2'),
      tinyApis.sAssertContent('<h2>a</h2>')
    ]);
  };

  const sInsertLink = function (url) {
    return Chain.asStep({}, [
      Toolbar.cWaitForToolbar,
      Toolbar.cClickButton('Insert/Edit link'),
      Toolbar.cWaitForToolbar,
      UiFinder.cFindIn('input'),
      UiControls.cSetValue(url),
      Toolbar.cWaitForToolbar,
      Toolbar.cClickButton('Ok')
    ]);
  };

  const cWaitForConfirmDialog = Chain.fromChainsWith(dialogRoot, [
    UiFinder.cWaitForState('window element', '.mce-window', function () {
      return true;
    })
  ]);

  const cClickButton = function (btnText) {
    return Chain.fromChains([
      UiFinder.cFindIn('button:contains("' + btnText + '")'),
      Mouse.cTrueClick
    ]);
  };

  const sClickConfirmButton = function (btnText) {
    return Chain.asStep({}, [
      cWaitForConfirmDialog,
      cClickButton(btnText)
    ]);
  };

  const sInsertLinkConfirmPrefix = function (url, btnText) {
    return GeneralSteps.sequence([
      sInsertLink(url),
      sClickConfirmButton(btnText)
    ]);
  };

  const sUnlink = Chain.asStep({}, [
    Toolbar.cWaitForToolbar,
    Toolbar.cClickButton('Insert/Edit link'),
    Toolbar.cWaitForToolbar,
    Toolbar.cClickButton('Remove link')
  ]);

  const sLinkTests = function (tinyApis, tinyActions) {
    const sContentActionTest = function (inputHtml, spath, soffset, fpath, foffset, expectedHtml, sAction) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(inputHtml),
        tinyApis.sSetSelection(spath, soffset, fpath, foffset),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        sAction,
        tinyApis.sAssertContent(expectedHtml)
      ]);
    };

    const sLinkTest = function (inputHtml, spath, soffset, fpath, foffset, url, expectedHtml) {
      return sContentActionTest(inputHtml, spath, soffset, fpath, foffset, expectedHtml, sInsertLink(url));
    };

    const sUnlinkTest = function (inputHtml, spath, soffset, fpath, foffset, expectedHtml) {
      return sContentActionTest(inputHtml, spath, soffset, fpath, foffset, expectedHtml, sUnlink);
    };

    const sLinkWithConfirmOkTest = function (inputHtml, spath, soffset, fpath, foffset, url, expectedHtml) {
      return sContentActionTest(inputHtml, spath, soffset, fpath, foffset, expectedHtml, sInsertLinkConfirmPrefix(url, 'Ok'));
    };

    const sLinkWithConfirmCancelTest = function (inputHtml, spath, soffset, fpath, foffset, url, expectedHtml) {
      return sContentActionTest(inputHtml, spath, soffset, fpath, foffset, expectedHtml, sInsertLinkConfirmPrefix(url, 'Cancel'));
    };

    return GeneralSteps.sequence([
      sLinkWithConfirmOkTest('<p>a</p>', [0, 0], 0, [0, 0], 1, 'www.site.com', '<p><a href="http://www.site.com">a</a></p>'),
      sLinkWithConfirmCancelTest('<p>a</p>', [0, 0], 0, [0, 0], 1, 'www.site.com', '<p><a href="www.site.com">a</a></p>'),
      sLinkTest('<p>a</p>', [0, 0], 0, [0, 0], 1, '#1', '<p><a href="#1">a</a></p>'),
      sLinkTest('<p><a id="x" href="#1">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '#2', '<p><a id="x" href="#2">a</a></p>'),
      sLinkTest('<p><a href="#3">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '', '<p>a</p>'),
      sUnlinkTest('<p><a id="x" href="#1">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '<p>a</p>')
    ]);
  };

  const sInsertTableTests = function (tinyApis) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p><br></p><p>b</p>'),
      tinyApis.sSetCursor([0], 0),
      Toolbar.sClickButton('Insert table'),
      tinyApis.sAssertContent([
        '<table style="width: 100%;">',
        '<tbody>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '</tbody>',
        '</table>',
        '<p>b</p>'
      ].join('\n')
      )
    ]);
  };

  const sAriaTests = function (tinyApis, tinyActions) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p>a</p>'),
      tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
      Toolbar.sWaitForToolbar(),
      tinyActions.sContentKeydown(121, { alt: true }),
      sClickFocusedButton('*[aria-label="Bold"]'),
      tinyApis.sAssertContent('<p><strong>a</strong></p>')
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor), tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sBoldTests(tinyApis),
      sH2Tests(tinyApis),
      sLinkTests(tinyApis, tinyActions),
      sInsertTableTests(tinyApis),
      sAriaTests(tinyApis, tinyActions)
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
