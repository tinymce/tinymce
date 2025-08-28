import { ApproxStructure } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as BlockRangeDelete from 'tinymce/core/delete/BlockRangeDelete';

describe('browser.tinymce.core.delete.BlockRangeDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const doDelete = (editor: Editor) => {
    const returnVal = BlockRangeDelete.backspaceDelete(editor, true);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopDelete = (editor: Editor) => {
    const returnVal = BlockRangeDelete.backspaceDelete(editor, true);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
  };

  const doBackspace = (editor: Editor) => {
    const returnVal = BlockRangeDelete.backspaceDelete(editor, false);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  const noopBackspace = (editor: Editor) => {
    const returnVal = BlockRangeDelete.backspaceDelete(editor, false);
    assert.isFalse(returnVal.isSome(), 'Should return false since the operation is a noop');
  };

  it('Backspace on collapsed range should be a noop', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete on collapsed range should be a noop', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    noopDelete(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace on range between simple blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete on range between simple blocks should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0 ], 0);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Backspace from red span to h1 should merge', () => {
    const editor = hook.editor();
    editor.setContent('<h1>ab</h1><p><span style="color: red;">cd</span></p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 1, 0, 0 ], 1);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">d</span></h1>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete from red span to h1 should merge', () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="color: red;">ab</span></p><h1>cd</h1>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 1, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<p><span style="color: red;">a</span>d</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Delete from li to li should merge', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>ab</li><li>cd</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 1, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<ul><li>ad</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Delete from nested li to li should merge', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>ab<ul><li>cd</li></ul></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 1, 0, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<ul><li>ad</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Delete from li to nested li should merge', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>ab<ul><li>cd</li></ul></li><li>ef</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 1, 0, 0 ], 1, [ 0, 1, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<ul><li>ab<ul><li>cf</li></ul></li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 1, 0, 0 ], 1, [ 0, 0, 1, 0, 0 ], 1);
  });

  it('Delete from deep nested li to li should merge', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>ab<ul><li>cd<ul><li>ef</li></li></ul></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 1, 0, 1, 0, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<ul><li>af</li></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
  });

  it('Delete on selection of everything should empty editor', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    TinyAssertions.assertContentStructure(editor,
      ApproxStructure.build((s, str) => {
        return s.element('body', {
          children: [
            s.element('p', { children: [ s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}) ] })
          ]
        });
      })
    );
  });

  it('Backspace selected paragraphs in td should produce an padded empty cell and also not delete the whole table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0 ], 1);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
  });

  it('Delete selected paragraphs in td should produce an padded empty cell and also not delete the whole table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td><p>a</p><p>b</p></td></tr></tbody></table>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 1, 0 ], 1);
    doDelete(editor);
    TinyAssertions.assertContent(editor, '<table><tbody><tr><td><p>&nbsp;</p></td></tr></tbody></table>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 0);
  });
});
