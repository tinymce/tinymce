import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Levels from 'tinymce/core/undo/Levels';
import { UndoLevelType } from 'tinymce/core/undo/UndoManagerTypes';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.undo.LevelsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  const getBookmark = function (editor) {
    return editor.selection.getBookmark(2, true);
  };

  suite.test('createFragmentedLevel', function () {
    LegacyUnit.deepEqual(Levels.createFragmentedLevel(['a', 'b']), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: ['a', 'b'],
      type: UndoLevelType.Fragmented
    });
  });

  suite.test('createCompleteLevel', function () {
    LegacyUnit.deepEqual(Levels.createCompleteLevel('a'), {
      beforeBookmark: null,
      bookmark: null,
      content: 'a',
      fragments: null,
      type: UndoLevelType.Complete
    });
  });

  suite.test('createFromEditor', function (editor) {
    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<p><br data-mce-bogus="1"></p>',
      fragments: null,
      type: UndoLevelType.Complete
    });

    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe>a<!--b-->c';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: ['<iframe src="about:blank"></iframe>', 'a', '<!--b-->', 'c'],
      type: UndoLevelType.Fragmented
    });
  });

  suite.test('createFromEditor removes bogus=al', function (editor) {
    editor.getBody().innerHTML = '<p data-mce-bogus="all">a</p> <span>b</span>';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: ' <span>b</span>',
      fragments: null,
      type: UndoLevelType.Complete
    });
  });

  suite.test('createFromEditor removes bogus=all', function (editor) {
    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <p data-mce-bogus="all">a</p> <span>b</span>';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
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

  suite.test('applyToEditor to equal content with complete level', function (editor) {
    const level = Levels.createCompleteLevel('<p>a</p>');
    level.bookmark = { start: [1, 0, 0] };

    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>a</p>');
    LegacyUnit.deepEqual(getBookmark(editor), { start: [1, 0, 0] });
  });

  suite.test('applyToEditor to different content with complete level', function (editor) {
    const level = Levels.createCompleteLevel('<p>b</p>');
    level.bookmark = { start: [1, 0, 0] };

    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>b</p>');
    LegacyUnit.deepEqual(getBookmark(editor), { start: [1, 0, 0] });
  });

  suite.test('applyToEditor to different content with fragmented level', function (editor) {
    const level = Levels.createFragmentedLevel(['<p>a</p>', '<p>b</p>']);
    level.bookmark = { start: [1, 0, 0] };

    editor.getBody().innerHTML = '<p>c</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    LegacyUnit.strictEqual(editor.getBody().innerHTML, '<p>a</p><p>b</p>');
    LegacyUnit.deepEqual(getBookmark(editor), { start: [1, 0, 0] });
  });

  suite.test('isEq', function () {
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'b'])), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', 'c'])), false);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('a')), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('b')), false);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a']), Levels.createCompleteLevel('a')), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel(['a'])), true);
  });

  suite.test('isEq ignore bogus elements', function () {
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', '<span data-mce-bogus="1">b</span>']), Levels.createFragmentedLevel(['a', 'b'])), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['a', 'b']), Levels.createFragmentedLevel(['a', '<span data-mce-bogus="1">b</span>'])), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createCompleteLevel('<span data-mce-bogus="1">a</span>')), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('<span data-mce-bogus="1">a</span>'), Levels.createCompleteLevel('a')), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), Levels.createFragmentedLevel(['<span data-mce-bogus="1">a</span>'])), true);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel(['<span data-mce-bogus="1">a</span>']), Levels.createCompleteLevel('a')), true);
  });

  suite.test('isEq passed undefined', function () {
    LegacyUnit.strictEqual(Levels.isEq(undefined, Levels.createFragmentedLevel(['a', 'b'])), false);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createCompleteLevel('a'), undefined), false);
    LegacyUnit.strictEqual(Levels.isEq(undefined, undefined), false);
    LegacyUnit.strictEqual(Levels.isEq(Levels.createFragmentedLevel([]), Levels.createFragmentedLevel([])), true);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
