import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.TableTableNavigationDisabledTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    table_tab_navigation: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const tableHtml = '<table><tbody><tr><td>a</td></tr><tr><td>a</td></tr></tbody></table>';

  it('TBA: test table tab navigation does nothing', () => {
    const editor = hook.editor();
    editor.setContent(tableHtml);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });
});
