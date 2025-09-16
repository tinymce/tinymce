import { Keys } from '@ephox/agar';
import {describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type   Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.AbsoluteElementNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    height: 300,
    setup: (ed: Editor) => {
      ed.on('SelectionChange', () => {
        console.log(ed.selection.getNode());
      });
    }
  }, [], true);

  const assertNode = (editor: Editor, f: (node: Node) => boolean) => {
    const node = editor.selection.getNode();
    assert.isTrue(f(node), 'Check selection is node');
  };

  it.skip('TINY-10326: Move the caret around an absolute CEF element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<p>Tobias<span style="position: absolute; right: 30px;" contenteditable="false"> button </span><br>Linus</p>`
    );

    // Move the cursor to 'Tobias|'
    TinySelections.setCursor(editor, [ 0, 0 ], 'Tobias'.length);
    TinyContentActions.keydown(editor, Keys.right());

    // Move back to the floated button
    assertNode(editor, (node) => Attribute.has(SugarElement.fromDom(node), 'data-mce-selected'));
    // Move the cursor to '|Linus'
    TinyContentActions.keydown(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 3 ], 0);

    // Move back to the floated button
    TinyContentActions.keydown(editor, Keys.left());
    assertNode(editor, (node) => Attribute.has(SugarElement.fromDom(node), 'data-mce-selected'));

    // Move the cursor to 'Tobias|'
    TinyContentActions.keydown(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ],'Tobias'.length);
  });

  it('TINY-10326: Move the caret around an absolute element (not CEF)', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<p>Absolute <span style="position: absolute; right: 30px;">element</span>after</p>`
    );

    // Move the cursor to 'Tobias|'
    TinySelections.setCursor(editor, [ 0, 0 ], 'Tobias'.length);
    TinyContentActions.keydown(editor, Keys.right());
    TinySelections.setCursor(editor, [0, 0, 0 , 0], 0);
    // // Move back to the floated button
    // assertNode(editor, (node) => Attribute.has(SugarElement.fromDom(node), 'data-mce-selected'));
    // // Move the cursor to '|Linus'
    // TinyContentActions.keydown(editor, Keys.right());
    // TinyAssertions.assertCursor(editor, [ 0, 3 ], 0);

    // // Move back to the floated button
    // TinyContentActions.keydown(editor, Keys.left());
    // assertNode(editor, (node) => Attribute.has(SugarElement.fromDom(node), 'data-mce-selected'));

    // // Move the cursor to 'Tobias|'
    // TinyContentActions.keydown(editor, Keys.left());
    // TinyAssertions.assertCursor(editor, [ 0, 0 ],'Tobias'.length);
  });
});
