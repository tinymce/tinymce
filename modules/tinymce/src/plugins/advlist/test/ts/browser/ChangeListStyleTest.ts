import { GeneralSteps, Logger, Pipeline, Waiter, UiFinder } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import AdvlistPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { Element, ShadowDom } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.plugins.advlist.ChangeListStyleTest', function (success, failure) {
  Theme();
  ListsPlugin();
  AdvlistPlugin();

  TinyLoader.setupInBodyAndShadowRoot((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const contentContainer = ShadowDom.getContentContainer(ShadowDom.getRootNode(Element.fromDom(editor.getElement())));
    const sWaitForMenu = () => Waiter.sTryUntil(
      'Waiting for menu to appear',
      UiFinder.sExists(contentContainer, '.tox-menu.tox-selected-menu')
    );

    Pipeline.async({}, [
      Logger.t('ul to alpha, cursor only in parent', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron'),
        sWaitForMenu(),
        tinyUi.sClickOnUi('click lower alpha item', 'div.tox-selected-menu[role="menu"] div[title="Lower Alpha"]'),
        tinyApis.sAssertContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ul><li>b</li></ul></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ])),
      Logger.t('ul to alpha, selection from parent to sublist', GeneralSteps.sequence([
        tinyApis.sSetContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron'),
        sWaitForMenu(),
        tinyUi.sClickOnUi('click lower alpha item', 'div.tox-selected-menu[role="menu"] div[title="Lower Alpha"]'),
        tinyApis.sAssertContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ])),
      Logger.t('ol to ul, cursor only in parent', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click bullist button', '[aria-label="Bullet list"] > .tox-tbtn'),
        tinyApis.sAssertContent('<ul><li>a</li><ol><li>b</li></ol></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ])),
      Logger.t('ol to ul, selection from parent to sublist', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click bullist button', '[aria-label="Bullet list"] > .tox-tbtn'),
        tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ])),
      Logger.t('alpha to ol, cursor only in parent', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron'),
        sWaitForMenu(),
        tinyUi.sClickOnUi('click lower alpha item', 'div.tox-selected-menu[role="menu"] div[title="Default"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ])),
      Logger.t('alpha to ol, selection from parent to sublist', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron'),
        sWaitForMenu(),
        tinyUi.sClickOnUi('click lower alpha item', 'div.tox-selected-menu[role="menu"] div[title="Default"]'),
        tinyApis.sAssertContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ])),
      Logger.t('alpha to ul, cursor only in parent', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Bullet list"] > .tox-tbtn'),
        tinyApis.sAssertContent('<ul><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0)
      ])),
      Logger.t('alpha to ul, selection from parent to sublist', GeneralSteps.sequence([
        tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1),
        tinyUi.sClickOnToolbar('click numlist button', '[aria-label="Bullet list"] > .tox-tbtn'),
        tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    plugins: 'lists advlist',
    toolbar: 'numlist bullist',
    menubar: false,
    statusbar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
