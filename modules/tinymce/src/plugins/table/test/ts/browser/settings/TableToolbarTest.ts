import { Chain, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor as McEditor, UiChains } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.TableToolbarTest', (success, failure) => {
  TablePlugin();
  Theme();

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';
  const tableWithCaptionHtml = '<table><caption>Caption</caption><tbody><tr><td>x</td></tr></tbody></table>';

  const cCreateEditor = (toolbar: string) => McEditor.cFromSettings({
    plugins: 'table',
    table_toolbar: toolbar,
    base_url: '/project/tinymce/js/tinymce'
  });

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Table: test that table toolbar can be disabled', [
      cCreateEditor(''),
      ApiChains.cFocus,
      ApiChains.cSetContent(tableHtml),
      ApiChains.cSetSelection([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1),
      Chain.fromIsolatedChainsWith(Body.body(), [
        Chain.wait(100), // How should I do this better?
        // I want to check that the inline toolbar does not appear,
        // but I have to wait unless it won't exist any way because it's too fast
        UiFinder.cNotExists('div.tox-pop div.tox-toolbar')
      ]),
      McEditor.cRemove
    ]),
    Log.chainsAsStep('TINY-6006', 'Table: test toolbar icons disabled based on selection or state', [
      cCreateEditor('tablecopyrow tablepasterowafter tablepasterowbefore'),
      ApiChains.cFocus,
      ApiChains.cSetContent(tableWithCaptionHtml),
      ApiChains.cSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1),
      UiChains.cWaitForUi('Ensure the copy row toolbar button is disabled', '.tox-pop .tox-tbtn--disabled[title="Copy row"]'),
      UiChains.cWaitForUi('Ensure the paste row toolbar button is disabled', '.tox-pop .tox-tbtn--disabled[title="Paste row before"]'),
      ApiChains.cSetSelection([ 0, 1, 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0 ], 0),
      UiChains.cWaitForUi('Ensure the copy row toolbar button is enabled', '.tox-pop .tox-tbtn[title="Copy row"]:not(.tox-tbtn--disabled)'),
      UiChains.cWaitForUi('Ensure the paste row toolbar button is disabled', '.tox-pop .tox-tbtn--disabled[title="Paste row before"]'),
      ApiChains.cExecCommand('mceTableCopyRow'),
      UiChains.cWaitForUi('Ensure the paste row toolbar button is enabled', '.tox-pop .tox-tbtn[title="Paste row before"]:not(.tox-tbtn--disabled)'),
      McEditor.cRemove
    ])
  ], success, failure);
});
