import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.SelectedLinkTest', (success, failure) => {

  LinkPlugin();
  SilverTheme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Link: should not get anchor info if not selected node', [
        TestLinkUi.sClearHistory,
        tinyApis.sSetContent('<p><a href="http://tinymce.com">tiny</a></p>'),
        tinyApis.sSetSelection([ 0 ], 1, [ 0 ], 1),
        tinyApis.sExecCommand('mcelink'),
        TestLinkUi.sAssertDialogContents({
          href: '',
          text: '',
          title: '',
          target: ''
        }),
        TestLinkUi.sClickCancel,
        TestLinkUi.sClearHistory
      ]),
      Log.stepsAsStep('TINY-4867', 'Link: link should not be active when multiple links or plain text selected', [
        tinyApis.sSetContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 1),
        tinyUi.sWaitForUi('Check the link button is enabled (single link)', 'button[title="Insert/edit link"].tox-tbtn--enabled'),
        tinyApis.sSetSelection( [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
        tinyUi.sWaitForUi('Check the link button is enabled (collapsed in link)', 'button[title="Insert/edit link"].tox-tbtn--enabled'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 3),
        tinyUi.sWaitForUi('Check the link button is disabled (text)', 'button[title="Insert/edit link"]:not(.tox-tbtn--enabled)'),
        tinyApis.sSetSelection( [ 0, 1 ], 0, [ 0, 1 ], 2),
        tinyUi.sWaitForUi('Check the link button is disabled (multiple links)', 'button[title="Insert/edit link"]:not(.tox-tbtn--enabled)')
      ]),
      Log.stepsAsStep('TINY-4867', 'Link: openlink should be disabled when multiple links or plain text selected', [
        tinyApis.sSetContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 1),
        tinyUi.sWaitForUi('Check the open link button is enabled (single link)', 'button[title="Open link"]:not(.tox-tbtn--disabled)'),
        tinyApis.sSetSelection( [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
        tinyUi.sWaitForUi('Check the open link button is enabled (collapsed in link)', 'button[title="Open link"]:not(.tox-tbtn--disabled)'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 3),
        tinyUi.sWaitForUi('Check the open link button is disabled (text)', 'button[title="Open link"].tox-tbtn--disabled'),
        tinyApis.sSetSelection( [ 0, 1 ], 0, [ 0, 1 ], 2),
        tinyUi.sWaitForUi('Check the open link button is disabled (multiple links)', 'button[title="Open link"].tox-tbtn--disabled')
      ]),
      Log.stepsAsStep('TINY-4867', 'Link: unlink should be enabled when single link or multiple links selected', [
        tinyApis.sSetContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 3),
        tinyUi.sWaitForUi('Check the unlink button is enabled (single link)', 'button[title="Remove link"]:not(.tox-tbtn--disabled)'),
        tinyApis.sSetSelection( [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0),
        tinyUi.sWaitForUi('Check the unlink button is enabled (collapsed in link)', 'button[title="Remove link"]:not(.tox-tbtn--disabled)'),
        tinyApis.sSetSelection( [ 0, 1 ], 0, [ 0, 1 ], 2),
        tinyUi.sWaitForUi('Check the unlink button is disabled (text)', 'button[title="Remove link"].tox-tbtn--disabled'),
        tinyApis.sSetSelection( [ 0 ], 0, [ 0 ], 1),
        tinyUi.sWaitForUi('Check the unlink button is enabled (multiple links)', 'button[title="Remove link"]:not(.tox-tbtn--disabled)')
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link openlink unlink',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
