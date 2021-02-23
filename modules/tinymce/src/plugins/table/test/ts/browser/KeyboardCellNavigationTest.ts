import { Keys, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.quirks.KeyboardCellNavigationTest', () => {
  before(function () {
    if (!Env.webkit) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    height: 300
  }, [ Plugin, Theme ], true);

  const selectionChangeState = Cell(false);

  it('TBA: Create lists within table cells and verify keyboard navigation for the cells', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr><tr><td><ul><li>c</li><li>d</li></ul></td></tr></tbody></table>'
    );
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 1, 0 ], 0);
    TinyContentActions.keydown(editor, Keys.down());
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0, 0, 0 ], 0);
    editor.on('SelectionChange', () => {
      selectionChangeState.set(true);
    });
    await Waiter.pTryUntil(
      'editor did not have correct selection',
      () => {
        assert.isTrue(selectionChangeState.get(), 'state is true');
      }
    );
    TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0, 0, 0 ], 0);
  });
});
