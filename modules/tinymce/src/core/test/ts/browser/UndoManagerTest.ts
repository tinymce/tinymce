import { Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { LegacyUnit, TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { AddUndoEvent } from 'tinymce/core/api/EventTypes';
import { UndoLevel } from 'tinymce/core/undo/UndoManagerTypes';
import Theme from 'tinymce/themes/silver/Theme';

import * as HtmlUtils from '../module/test/HtmlUtils';
import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.core.UndoManagerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('Initial states', () => {
    const editor = hook.editor();
    assert.isFalse(editor.undoManager.hasUndo());
    assert.isFalse(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('One undo level', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    editor.focus();
    editor.execCommand('SelectAll');
    editor.execCommand('Bold');

    assert.isTrue(editor.undoManager.hasUndo());
    assert.isFalse(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('Two undo levels', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');

    assert.isTrue(editor.undoManager.hasUndo());
    assert.isFalse(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('No undo levels and one redo', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.undoManager.undo();

    assert.isFalse(editor.undoManager.hasUndo());
    assert.isTrue(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('One undo levels and one redo', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');
    editor.undoManager.undo();

    assert.isTrue(editor.undoManager.hasUndo());
    assert.isTrue(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('Typing state', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    assert.isFalse(editor.undoManager.typing);

    editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 65 });
    assert.isTrue(editor.undoManager.typing);

    editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 13 });
    assert.isFalse(editor.undoManager.typing);

    const selectAllFlags: Record<string, any> = { keyCode: 65, ctrlKey: false, altKey: false, shiftKey: false };

    if (Env.mac) {
      selectAllFlags.metaKey = true;
    } else {
      selectAllFlags.ctrlKey = true;
    }

    editor.dom.fire(editor.getBody(), 'keydown', selectAllFlags);
    assert.isFalse(editor.undoManager.typing);
  });

  it('Undo and add new level', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.undoManager.undo();
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');

    assert.isTrue(editor.undoManager.hasUndo());
    assert.isFalse(editor.undoManager.hasRedo());
    assert.isFalse(editor.undoManager.typing);
  });

  it('Events', () => {
    const editor = hook.editor();
    let add, undo, redo;

    editor.undoManager.clear();
    editor.setContent('test');

    editor.on('AddUndo', (e) => {
      add = e.level;
    });

    editor.on('Undo', (e) => {
      undo = e.level;
    });

    editor.on('Redo', (e) => {
      redo = e.level;
    });

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    assert.ok(!!add.content);
    assert.ok(!!add.bookmark);

    editor.undoManager.undo();
    assert.ok(!!undo.content);
    assert.ok(!!undo.bookmark);

    editor.undoManager.redo();
    assert.ok(!!redo.content);
    assert.ok(!!redo.bookmark);
  });

  it('No undo/redo cmds on Undo/Redo shortcut', () => {
    const editor = hook.editor();
    const commands = [];
    let added = false;

    editor.undoManager.clear();
    editor.setContent('test');

    editor.on('BeforeExecCommand', (e) => {
      commands.push(e.command);
    });

    editor.on('BeforeAddUndo', () => {
      added = true;
    });

    const evt = {
      keyCode: 90,
      metaKey: Env.mac,
      ctrlKey: !Env.mac,
      shiftKey: false,
      altKey: false
    };

    editor.dom.fire(editor.getBody(), 'keydown', evt);
    editor.dom.fire(editor.getBody(), 'keypress', evt);
    editor.dom.fire(editor.getBody(), 'keyup', evt);

    assert.isFalse(added);
    assert.deepEqual(commands, [ 'mceFocus', 'Undo' ]);
  });

  it('Transact', () => {
    const editor = hook.editor();
    let count = 0;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', () => {
      count++;
    });

    const level = editor.undoManager.transact(() => {
      editor.undoManager.add();
      editor.undoManager.add();
    });

    assert.equal(count, 1);
    assert.isNotNull(level);
  });

  it('Transact no change', () => {
    const editor = hook.editor();
    editor.undoManager.add();

    const level = editor.undoManager.transact(Fun.noop);

    assert.isNull(level);
  });

  it('Transact with change', () => {
    const editor = hook.editor();
    editor.undoManager.add();

    const level = editor.undoManager.transact(() => {
      editor.setContent('x');
    });

    assert.isNotNull(level);
  });

  it('Transact nested', () => {
    const editor = hook.editor();
    let count = 0;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', () => {
      count++;
    });

    editor.undoManager.transact(() => {
      editor.undoManager.add();

      editor.undoManager.transact(() => {
        editor.undoManager.add();
      });
    });

    assert.equal(count, 1);
  });

  it('Transact exception', () => {
    const editor = hook.editor();
    let count = 0;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', () => {
      count++;
    });

    try {
      editor.undoManager.transact(() => {
        throw new Error('Test');
      });

      assert.fail('Should never get here!');
    } catch (ex) {
      assert.equal(ex.message, 'Test');
    }

    editor.undoManager.add();

    assert.equal(count, 1);
  });

  it('Extra with changes', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.undoManager.add();

    editor.undoManager.extra(() => {
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
      editor.insertContent('1');
    }, () => {
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
      editor.insertContent('2');
    });

    const data = editor.undoManager.data;
    assert.lengthOf(data, 3);
    assert.equal(data[0].content, '<p>abc</p>');
    assert.deepEqual(data[0].bookmark, { start: [ 0, 0, 0 ] });
    assert.deepEqual(data[0].beforeBookmark, { start: [ 0, 0, 0 ] });
    assert.equal(data[1].content, '<p>a1c</p>');
    assert.deepEqual(data[1].bookmark, { start: [ 2, 0, 0 ] });
    assert.deepEqual(data[1].beforeBookmark, { start: [ 2, 0, 0 ] });
    assert.equal(data[2].content, '<p>a2c</p>');
    assert.deepEqual(data[2].bookmark, { start: [ 2, 0, 0 ] });
    assert.deepEqual(data[1].beforeBookmark, data[2].bookmark);
  });

  it('Exclude internal elements', () => {
    const editor = hook.editor();
    let count = 0, lastLevel: UndoLevel;

    editor.undoManager.clear();
    assert.equal(count, 0);

    editor.on('AddUndo', () => {
      count++;
    });

    editor.on('BeforeAddUndo', (e) => {
      lastLevel = e.level;
    });

    editor.getBody().innerHTML = (
      'test' +
      '<img src="about:blank" data-mce-selected="1" />' +
      '<table data-mce-selected="1"><tr><td>x</td></tr></table>'
    );

    editor.undoManager.add();
    assert.equal(count, 1);
    assert.equal(HtmlUtils.cleanHtml(lastLevel.content),
      'test' +
      '<img src="about:blank">' +
      '<table><tbody><tr><td>x</td></tr></tbody></table>'
    );

    editor.getBody().innerHTML = (
      '<span data-mce-bogus="1">x</span>' +
      '<span data-mce-bogus="1">\uFEFF</span>' +
      '<div data-mce-bogus="all"></div>' +
      '<div data-mce-bogus="all"><div><b>x</b></div></div>' +
      '<img src="about:blank" data-mce-bogus="all">' +
      '<br data-mce-bogus="1">' +
      'test' +
      '\u200B' +
      '<img src="about:blank" />' +
      '<table><tr><td>x</td></tr></table>'
    );

    editor.undoManager.add();
    assert.equal(count, 2);
    assert.equal(HtmlUtils.cleanHtml(lastLevel.content),
      '<span data-mce-bogus="1">x</span>' +
      '<span data-mce-bogus="1"></span>' +
      '<br data-mce-bogus="1">' +
      'test' +
      '\u200B' +
      '<img src="about:blank">' +
      '<table><tbody><tr><td>x</td></tr></tbody></table>'
    );
  });

  it('Undo added when typing and losing focus', () => {
    const editor = hook.editor();
    let lastLevel: UndoLevel;

    editor.on('BeforeAddUndo', (e) => {
      lastLevel = e.level;
    });

    editor.undoManager.clear();
    editor.setContent('<p>some text</p>');
    LegacyUnit.setSelection(editor, 'p', 4, 'p', 9);
    KeyUtils.type(editor, '\b');

    assert.equal(HtmlUtils.cleanHtml(lastLevel.content), '<p>some text</p>');
    editor.fire('blur');
    assert.equal(HtmlUtils.cleanHtml(lastLevel.content), '<p>some</p>');

    editor.execCommand('FormatBlock', false, 'h1');
    editor.undoManager.undo();
    assert.equal(editor.getContent(), '<p>some</p>');
  });

  it('BeforeAddUndo event', () => {
    const editor = hook.editor();
    let lastEvt, addUndoEvt: AddUndoEvent;

    const blockEvent = (e) => {
      e.preventDefault();
    };

    editor.on('BeforeAddUndo', (e) => {
      lastEvt = e;
    });

    editor.undoManager.clear();
    editor.setContent('<p>a</p>');
    editor.undoManager.add();

    assert.equal(lastEvt.lastLevel, undefined);
    assert.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>a</p>');

    editor.setContent('<p>b</p>');
    editor.undoManager.add();

    assert.equal(HtmlUtils.cleanHtml(lastEvt.lastLevel.content), '<p>a</p>');
    assert.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>b</p>');

    editor.on('BeforeAddUndo', blockEvent);

    editor.on('AddUndo', (e) => {
      addUndoEvt = e;
    });

    editor.setContent('<p>c</p>');
    editor.undoManager.add(null, { data: 1 });

    assert.equal(HtmlUtils.cleanHtml(lastEvt.lastLevel.content), '<p>b</p>');
    assert.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>c</p>');
    assert.equal(lastEvt.originalEvent.data, 1);
    assert.isUndefined(addUndoEvt, 'Event level produced when it should be blocked');

    editor.off('BeforeAddUndo', blockEvent);
  });

  it('Dirty state type letter', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    assert.isFalse(editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, 'b');
    assert.equal(editor.getContent(), '<p>ab</p>');
    assert.isTrue(editor.isDirty(), 'Dirty state should be true');
  });

  it('Dirty state type shift+letter', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    assert.isFalse(editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, { keyCode: 65, charCode: 66, shiftKey: true });
    assert.equal(editor.getContent(), '<p>aB</p>');
    assert.isTrue(editor.isDirty(), 'Dirty state should be true');
  });

  it('Dirty state type AltGr+letter', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    assert.isFalse(editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, { keyCode: 65, charCode: 66, ctrlKey: true, altKey: true });
    assert.equal(editor.getContent(), '<p>aB</p>');
    assert.isTrue(editor.isDirty(), 'Dirty state should be true');
  });

  it('Dirty state on second AddUndo', (done) => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    let first = true;
    const test = () => {
      if (first) {
        first = false;
        if (editor.isDirty()) {
          done('Dirty flag should not be set on first AddUndo.');
        }
      } else {
        if (!editor.isDirty()) {
          done('Dirty flag should be set after second AddUndo.');
        }
      }
    };

    editor.undoManager.clear();
    editor.setDirty(false);
    editor.on('AddUndo', test);
    KeyUtils.type(editor, '\n');
    KeyUtils.type(editor, '\n');

    editor.off('AddUndo', test);
    done();
  });

  it('ExecCommand while typing should produce undo level', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    assert.isFalse(editor.undoManager.typing);
    KeyUtils.type(editor, { keyCode: 66, charCode: 66 });
    assert.isTrue(editor.undoManager.typing);
    assert.equal(editor.getContent(), '<p>aB</p>');
    editor.execCommand('mceInsertContent', false, 'C');
    assert.isFalse(editor.undoManager.typing);
    assert.lengthOf(editor.undoManager.data, 3);
    assert.equal(editor.undoManager.data[0].content, '<p>a</p>');
    assert.equal(editor.undoManager.data[1].content, '<p>aB</p>');
    assert.equal(editor.undoManager.data[2].content, '<p>aBC</p>');
  });

  it('transact while typing should produce undo level', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    assert.isFalse(editor.undoManager.typing);
    KeyUtils.type(editor, { keyCode: 66, charCode: 66 });
    assert.isTrue(editor.undoManager.typing);
    assert.equal(editor.getContent(), '<p>aB</p>');
    editor.undoManager.transact(() => {
      (editor.getBody().firstChild.firstChild as Text).data = 'aBC';
    });
    assert.isFalse(editor.undoManager.typing);
    assert.lengthOf(editor.undoManager.data, 3);
    assert.equal(editor.undoManager.data[0].content, '<p>a</p>');
    assert.equal(editor.undoManager.data[1].content, '<p>aB</p>');
    assert.equal(editor.undoManager.data[2].content, '<p>aBC</p>');
  });

  it('ignore does a transaction but no levels', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.undoManager.typing = true;

    editor.undoManager.ignore(() => {
      editor.execCommand('bold');
      editor.execCommand('italic');
    });

    assert.isTrue(editor.undoManager.typing);
    assert.lengthOf(editor.undoManager.data, 0);
    assert.equal(editor.getContent(), '<p><em><strong>a</strong></em></p>');
  });

  it('undo filter for mceRepaint is case insensitive', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.execCommand('mceRepaint');
    assert.isFalse(editor.undoManager.hasUndo());
  });

  it('TINY-7373: undo filter for mceFocus is case insensitive', () => {
    const editor = hook.editor();
    editor.undoManager.clear();
    editor.execCommand('mceFocus');
    assert.isFalse(editor.undoManager.hasUndo());
  });

  context('Undo when first element is contenteditable="false"', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.focus();
      editor.resetContent('<div contenteditable="false"><p>CEF</p></div><p>something</p><p>something else</p>');
    });

    it('TINY-7663: No fake caret - should restore correct cursor location', () => {
      const editor = hook.editor();
      TinyAssertions.assertContentPresence(editor, { 'p[data-mce-caret=before]': 1 });
      // selection path must include fake caret which is before the CEF div
      TinySelections.setCursor(editor, [ 3, 0 ], 14);
      // moving the selection removed the fake caret
      TinyAssertions.assertContentPresence(editor, { 'p[data-mce-caret=before]': 0 });
      // the act of moving the cursor removed the fake caret so now the selection path is off by one (expected)
      TinyAssertions.assertCursor(editor, [ 2, 0 ], 14);

      TinyContentActions.keystroke(editor, Keys.enter());
      editor.undoManager.undo();
      TinyAssertions.assertContent(editor, '<div contenteditable="false"><p>CEF</p></div><p>something</p><p>something else</p>');
      TinyAssertions.assertCursor(editor, [ 2, 0 ], 14);
    });

    it('TINY-7663: Fake caret - should restore correct cursor location', () => {
      const editor = hook.editor();
      TinyAssertions.assertContentPresence(editor, { 'p[data-mce-caret=before]': 1 });
      TinyAssertions.assertCursor(editor, [ 0 ], 0);

      TinyContentActions.keystroke(editor, Keys.enter());
      editor.undoManager.undo();
      TinyAssertions.assertContent(editor, '<div contenteditable="false"><p>CEF</p></div><p>something</p><p>something else</p>');
      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });
  });
});
