import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Attribute, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.SplitFloatingToolbarKeyboardNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    menubar: false,
    width: 1000,
    setup: (ed: Editor) => {
      ed.ui.registry.addMenuButton('menubutton', {
        icon: 'bookmark',
        tooltip: 'menubutton',
        fetch: (success) => {
          success('bold strikethrough');
        }
      });
    },
    toolbar: 'redo undo | styles | bold italic underline strikethrough forecolor backcolor | removeformat alignleft aligncenter alignright alignjustify | indent outdent |'
  + ' fontfamily fontsize | bold italic | lignheight | print underline menubutton alignright | alignleft aligncenter',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true );

  it('TINY-9723: Menu toolbar items should not be tabstoppable', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Reveal or hide additional toolbar items"]');
    const menubutton = await TinyUiActions.pWaitForPopup(editor, '.tox-tbtn[title="menubutton"]');
    assert.isFalse(Attribute.has(menubutton, 'data-alloy-tabstop'));
    // Focus is on the first toolbar__group on the fontsize button
    TinyUiActions.keystroke(editor, Keys.tab());
    // Focus is on the second toolbar__group on the bold button
    TinyUiActions.keystroke(editor, Keys.tab());
    // Focus is on the third toolbar__group on the print button
    TinyUiActions.keystroke(editor, Keys.tab());
    // Focus is on the fourth toolbar__group on the alignleft button
    // Focus should not be on the third toolbar__group on the menubutton button
    const alignleftButton = FocusTools.getFocused(SugarDocument.getDocument()).getOrDie();
    assert.notStrictEqual(Attribute.get(alignleftButton, 'title'), 'menubutton');
  });
});
