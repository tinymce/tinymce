import { Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.TableNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Up navigation', () => {
    it('Arrow up on first position in table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Arrow up on first position in table cell to caption', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>a</caption><tbody><tr><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
      TinyAssertions.assertContent(editor, '<table><caption>a</caption><tbody><tr><td>b</td></tr></tbody></table>');
    });

    it('Arrow up on second position in first table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
      TinyAssertions.assertContent(editor, '<p>&nbsp;</p><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
    });

    it('Arrow up on first position in first table cell on the second row', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.up());
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
    });
  });

  context('Down navigation', () => {
    it('Arrow down on last position in last table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>');
    });

    it('Arrow down on last position in last table cell with br', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b<br></td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>');
    });

    it('Arrow down on second last position in last table cell', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 0);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table><p>&nbsp;</p>');
    });

    it('Arrow down on last position in last table cell on the first row', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.down());
      TinyAssertions.assertSelection(editor, [ 0, 0, 1, 1, 0 ], 1, [ 0, 0, 1, 1, 0 ], 1);
      TinyAssertions.assertContent(editor, '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>');
    });
  });
});
