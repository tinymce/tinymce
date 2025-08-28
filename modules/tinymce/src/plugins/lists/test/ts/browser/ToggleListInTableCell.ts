import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ToggleListWithEmptyLiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists table',
    toolbar: 'bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const wrapInsideTable = (content: string): string =>
    `<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 50%;"><col style="width: 50%;"></colgroup><tbody><tr><td>${content}</td></tr></tbody></table>`;

  const wrapInsideTableWithList = (content: string): string =>
    `<table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 50%;"><col style="width: 50%;"></colgroup><tbody><tr><td><ul><li>${content}</li></ul></td></tr></tbody></table>`;

  it('TINY-6853: toggle list inside table cell with anchor outside of anchor to the left of the anchor should include the anchor in the list', () => {
    const editor = hook.editor();
    const content = '<a href="#">link</a>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
    // Needed to move the cursor outside of the link
    TinyContentActions.keystroke(editor, Keys.left());
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with anchor containing an img tag outside of anchor to the left of the anchor should include the anchor in the list', () => {
    const editor = hook.editor();
    const content = '<a href="#"><strong><em><img src="#"></em></strong></a>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with anchor outside of anchor to the right of the anchor should include the anchor in the list', () => {
    const editor = hook.editor();
    const content = '<a href="#">link</a>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 1);
    // Needed to move the cursor outside of the link
    TinyContentActions.keystroke(editor, Keys.right());
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with anchor and other inline elements before the anchor should include all the inline elements in the list', () => {
    const editor = hook.editor();
    const content = 'abc <em>def</em> <a href="#">link</a>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with anchor and other inline elements after the anchor should include all the inline elements in the list', () => {
    const editor = hook.editor();
    const content = '<a href="#">link</a> abc <em>def</em>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 2, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with anchor and other inline elements around the anchor should include all the inline elements in the list', () => {
    const editor = hook.editor();
    const content = 'abc <em>def</em> <a href="#">link</a> efg <em>hij</em>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 1, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

  it('TINY-6853: toggle list inside table cell with cursor between two anchors should include both anchors in the list', () => {
    const editor = hook.editor();
    const content = '<a href="#">a</a><a href="#">b</a>';
    editor.setContent(wrapInsideTable(content));
    TinySelections.setCursor(editor, [ 0, 1, 0, 0, 1 ], 0);
    // Needed to move the cursor outside of the link
    TinyContentActions.keystroke(editor, Keys.left());
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, wrapInsideTableWithList(content));
  });

});
