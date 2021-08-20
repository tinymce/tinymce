import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Levels from 'tinymce/core/undo/Levels';
import { UndoLevelType } from 'tinymce/core/undo/UndoManagerTypes';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.undo.LevelsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const getBookmark = (editor: Editor) => {
    return editor.selection.getBookmark(2, true);
  };

  it('createFragmentedLevel', () => {
    assert.deepEqual(Levels.createFragmentedLevel([ 'a', 'b' ]), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [ 'a', 'b' ],
      type: UndoLevelType.Fragmented
    });
  });

  it('createCompleteLevel', () => {
    assert.deepEqual(Levels.createCompleteLevel('a'), {
      beforeBookmark: null,
      bookmark: null,
      content: 'a',
      fragments: null,
      type: UndoLevelType.Complete
    });
  });

  it('createFromEditor', () => {
    const editor = hook.editor();
    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<p><br data-mce-bogus="1"></p>',
      fragments: null,
      type: UndoLevelType.Complete
    });

    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe>a<!--b-->c';

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [ '<iframe src="about:blank"></iframe>', 'a', '<!--b-->', 'c' ],
      type: UndoLevelType.Fragmented
    });
  });

  it('createFromEditor removes bogus=al', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p data-mce-bogus="all">a</p> <span>b</span>';

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: ' <span>b</span>',
      fragments: null,
      type: UndoLevelType.Complete
    });
  });

  it('createFromEditor removes bogus=all', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <p data-mce-bogus="all">a</p> <span>b</span>';

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [
        '<iframe src="about:blank"></iframe>',
        ' ',
        ' ',
        '<span>b</span>'
      ],
      type: UndoLevelType.Fragmented
    });
  });

  it('applyToEditor to equal content with complete level', () => {
    const editor = hook.editor();
    const level = Levels.createCompleteLevel('<p>a</p>');
    level.bookmark = { start: [ 1, 0, 0 ] };

    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    assert.strictEqual(editor.getBody().innerHTML, '<p>a</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ] });
  });

  it('applyToEditor to different content with complete level', () => {
    const editor = hook.editor();
    const level = Levels.createCompleteLevel('<p>b</p>');
    level.bookmark = { start: [ 1, 0, 0 ] };

    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    assert.strictEqual(editor.getBody().innerHTML, '<p>b</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ] });
  });

  it('applyToEditor to different content with fragmented level', () => {
    const editor = hook.editor();
    const level = Levels.createFragmentedLevel([ '<p>a</p>', '<p>b</p>' ]);
    level.bookmark = { start: [ 1, 0, 0 ] };

    editor.getBody().innerHTML = '<p>c</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    assert.strictEqual(editor.getBody().innerHTML, '<p>a</p><p>b</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ] });
  });

  it('isEq', () => {
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ 'a', 'b' ]), Levels.createFragmentedLevel([ 'a', 'b' ])), true);
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ 'a', 'b' ]), Levels.createFragmentedLevel([ 'a', 'c' ])), false);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('a')), true);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('b')), false);
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ 'a' ]), Levels.createCompleteLevel('a')), true);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel([ 'a' ])), true);
  });

  it('isEq ignore bogus elements', () => {
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ 'a', '<span data-mce-bogus="1">b</span>' ]), Levels.createFragmentedLevel([ 'a', 'b' ])), true);
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ 'a', 'b' ]), Levels.createFragmentedLevel([ 'a', '<span data-mce-bogus="1">b</span>' ])), true);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('<span data-mce-bogus="1">a</span>')), true);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('<span data-mce-bogus="1">a</span>'), Levels.createCompleteLevel('a')), true);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel([ '<span data-mce-bogus="1">a</span>' ])), true);
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([ '<span data-mce-bogus="1">a</span>' ]), Levels.createCompleteLevel('a')), true);
  });

  it('isEq passed undefined', () => {
    assert.strictEqual(Levels.isEq(undefined, Levels.createFragmentedLevel([ 'a', 'b' ])), false);
    assert.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), undefined), false);
    assert.strictEqual(Levels.isEq(undefined, undefined), false);
    assert.strictEqual(Levels.isEq(Levels.createFragmentedLevel([]), Levels.createFragmentedLevel([])), true);
  });
});
