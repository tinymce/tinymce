import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyApis, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Levels from 'tinymce/core/undo/Levels';
import { UndoLevel } from 'tinymce/core/undo/UndoManagerTypes';

describe('browser.tinymce.core.undo.LevelsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const getBookmark = (editor: Editor) => {
    return editor.selection.getBookmark(2, true);
  };

  it('createFragmentedLevel', () => {
    assert.deepEqual(Levels.createFragmentedLevel([ 'a', 'b' ]), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [ 'a', 'b' ],
      type: 'fragmented'
    });
  });

  it('createCompleteLevel', () => {
    assert.deepEqual(Levels.createCompleteLevel('a'), {
      beforeBookmark: null,
      bookmark: null,
      content: 'a',
      fragments: null,
      type: 'complete'
    });
  });

  it('createFromEditor', () => {
    const editor = hook.editor();
    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<p><br data-mce-bogus="1"></p>',
      fragments: null,
      type: 'complete'
    });

    TinyApis(editor).setRawContent('<iframe src="about:blank"></iframe>a<!--b-->c');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [ '<iframe src="about:blank"></iframe>', 'a', '<!--b-->', 'c' ],
      type: 'fragmented'
    });
  });

  it('createFromEditor removes bogus=all and temporary attributes from content without iframes', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<p data-mce-bogus="all">a</p> <span>b</span> <span data-mce-selected="true">c</span>');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: ' <span>b</span> <span>c</span>',
      fragments: null,
      type: 'complete'
    });
  });

  it('createFromEditor removes bogus=all and temporary attributes from content with iframes', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<iframe src="about:blank"></iframe> <p data-mce-bogus="all">a</p> <span>b</span> <span data-mce-selected="true">c</span>');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [
        '<iframe src="about:blank"></iframe>',
        ' ',
        ' ',
        '<span>b</span>',
        ' ',
        '<span>c</span>'
      ],
      type: 'fragmented'
    });
  });

  it('TINY-10180: createFromEditor empties comments containing ZWNBSP', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<p>a</p> <!-- \ufeff --> <p>b</p> <!-- c --> <!-- d\ufeff -->');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<p>a</p> <!----> <p>b</p> <!-- c --> <!---->',
      fragments: null,
      type: 'complete'
    });
  });

  Arr.each([ 'noscript', 'style', 'script', 'xmp', 'noembed', 'noframes' ], (parent) => {
    it(`TINY-10305: createFromEditor empties ${parent} containing ZWNBSP`, () => {
      const editor = hook.editor();
      TinyApis(editor).setRawContent(`<p>a</p> <${parent}>b\ufeffc</${parent}> <p>d</p> <${parent}>e</${parent}>`);

      assert.deepEqual(Levels.createFromEditor(editor), {
        beforeBookmark: null,
        bookmark: null,
        content: `<p>a</p> <${parent}></${parent}> <p>d</p> <${parent}>e</${parent}>`,
        fragments: null,
        type: 'complete'
      });
    });
  });

  it('TINY-10305: createFromEditor empties iframe containing ZWNBSP', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<p>a</p> <iframe>b\ufeffc</iframe> <p>d</p> <iframe>e</iframe>');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [ '<p>a</p>', ' ', '<iframe></iframe>', ' ', '<p>d</p>', ' ', '<iframe>e</iframe>' ],
      type: 'fragmented'
    });
  });

  it('TINY-10305: createFromEditor empties plaintext containing ZWNBSP', () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent('<p>a</p> <plaintext>b\ufeffc <p>d</p> e');

    assert.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<p>a</p> <plaintext></plaintext>',
      fragments: null,
      type: 'complete'
    });
  });

  it('applyToEditor to equal content with complete level', () => {
    const editor = hook.editor();
    const level = Levels.createCompleteLevel('<p>a</p>') as UndoLevel;
    level.bookmark = { start: [ 1, 0, 0 ], forward: true };

    TinyApis(editor).setRawContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    TinyAssertions.assertRawContent(editor, '<p>a</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ], forward: true });
  });

  it('applyToEditor to different content with complete level', () => {
    const editor = hook.editor();
    const level = Levels.createCompleteLevel('<p>b</p>') as UndoLevel;
    level.bookmark = { start: [ 1, 0, 0 ], forward: true };

    TinyApis(editor).setRawContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    TinyAssertions.assertRawContent(editor, '<p>b</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ], forward: true });
  });

  it('applyToEditor to different content with fragmented level', () => {
    const editor = hook.editor();
    const level = Levels.createFragmentedLevel([ '<p>a</p>', '<p>b</p>' ]) as UndoLevel;
    level.bookmark = { start: [ 1, 0, 0 ], forward: true };

    TinyApis(editor).setRawContent('<p>c</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    Levels.applyToEditor(editor, level, false);

    TinyAssertions.assertRawContent(editor, '<p>a</p><p>b</p>');
    assert.deepEqual(getBookmark(editor), { start: [ 1, 0, 0 ], forward: true });
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
