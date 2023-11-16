import { Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Scroll } from '@ephox/sugar';
import { TinyDom, LegacyUnit, TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyApis } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { AddUndoEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { UndoLevel } from 'tinymce/core/undo/UndoManagerTypes';

import * as HtmlUtils from '../module/test/HtmlUtils';
import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.core.UndoManagerTest', () => {
  const os = PlatformDetection.detect().os;
  const isMac = os.isMacOS() || os.isiOS();

  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

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

    editor.dom.dispatch(editor.getBody(), 'keydown', { keyCode: 65 });
    assert.isTrue(editor.undoManager.typing);

    editor.dom.dispatch(editor.getBody(), 'keydown', { keyCode: 13 });
    assert.isFalse(editor.undoManager.typing);

    const selectAllFlags: Record<string, any> = { keyCode: 65, ctrlKey: false, altKey: false, shiftKey: false };

    if (isMac) {
      selectAllFlags.metaKey = true;
    } else {
      selectAllFlags.ctrlKey = true;
    }

    editor.dom.dispatch(editor.getBody(), 'keydown', selectAllFlags);
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
    let add: UndoLevel | undefined;
    let undo: UndoLevel | undefined;
    let redo: UndoLevel | undefined;

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
    assert.ok(!!add?.content);
    assert.ok(!!add?.bookmark);

    editor.undoManager.undo();
    assert.ok(!!undo?.content);
    assert.ok(!!undo?.bookmark);

    editor.undoManager.redo();
    assert.ok(!!redo?.content);
    assert.ok(!!redo?.bookmark);
  });

  it('No undo/redo cmds on Undo/Redo shortcut', () => {
    const editor = hook.editor();
    const commands: string[] = [];
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
      metaKey: isMac,
      ctrlKey: !isMac,
      shiftKey: false,
      altKey: false
    };

    editor.dom.dispatch(editor.getBody(), 'keydown', evt);
    editor.dom.dispatch(editor.getBody(), 'keypress', evt);
    editor.dom.dispatch(editor.getBody(), 'keyup', evt);

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
    } catch (ex: any) {
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
    assert.deepEqual(data[0].bookmark, { start: [ 0, 0, 0 ], forward: true });
    assert.deepEqual(data[0].beforeBookmark, { start: [ 0, 0, 0 ], forward: true });
    assert.equal(data[1].content, '<p>a1c</p>');
    assert.deepEqual(data[1].bookmark, { start: [ 2, 0, 0 ], forward: true });
    assert.deepEqual(data[1].beforeBookmark, { start: [ 2, 0, 0 ], forward: true });
    assert.equal(data[2].content, '<p>a2c</p>');
    assert.deepEqual(data[2].bookmark, { start: [ 2, 0, 0 ], forward: true });
    assert.deepEqual(data[1].beforeBookmark, data[2].bookmark);
  });

  it('Undo added when typing and losing focus', () => {
    const editor = hook.editor();
    let lastLevel: UndoLevel | undefined;

    editor.on('BeforeAddUndo', (e) => {
      lastLevel = e.level;
    });

    editor.undoManager.clear();
    editor.setContent('<p>some text</p>');
    LegacyUnit.setSelection(editor, 'p', 4, 'p', 9);
    KeyUtils.type(editor, '\b');

    assert.equal(HtmlUtils.cleanHtml(lastLevel?.content ?? ''), '<p>some text</p>');
    editor.dispatch('blur');
    assert.equal(HtmlUtils.cleanHtml(lastLevel?.content ?? ''), '<p>some</p>');

    editor.execCommand('FormatBlock', false, 'h1');
    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, '<p>some</p>');
  });

  it('BeforeAddUndo event', () => {
    const editor = hook.editor();
    let lastEvt: EditorEvent<AddUndoEvent> | undefined;
    let addUndoEvt: EditorEvent<AddUndoEvent> | undefined;

    const blockEvent = (e: EditorEvent<{}>) => {
      e.preventDefault();
    };

    editor.on('BeforeAddUndo', (e) => {
      lastEvt = e;
    });

    editor.undoManager.clear();
    editor.setContent('<p>a</p>');
    editor.undoManager.add();

    assert.equal(lastEvt?.lastLevel, undefined);
    assert.equal(HtmlUtils.cleanHtml(lastEvt?.level.content ?? ''), '<p>a</p>');

    editor.setContent('<p>b</p>');
    editor.undoManager.add();

    assert.equal(HtmlUtils.cleanHtml(lastEvt?.lastLevel?.content ?? ''), '<p>a</p>');
    assert.equal(HtmlUtils.cleanHtml(lastEvt?.level.content ?? ''), '<p>b</p>');

    editor.on('BeforeAddUndo', blockEvent);

    editor.on('AddUndo', (e) => {
      addUndoEvt = e;
    });

    editor.setContent('<p>c</p>');
    editor.undoManager.add(undefined, { data: 1 });

    assert.equal(HtmlUtils.cleanHtml(lastEvt?.lastLevel?.content ?? ''), '<p>b</p>');
    assert.equal(HtmlUtils.cleanHtml(lastEvt?.level?.content ?? ''), '<p>c</p>');
    assert.equal((lastEvt?.originalEvent as any)?.data, 1);
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
    TinyAssertions.assertContent(editor, '<p>ab</p>');
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
    TinyAssertions.assertContent(editor, '<p>aB</p>');
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
    TinyAssertions.assertContent(editor, '<p>aB</p>');
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
    TinyAssertions.assertContent(editor, '<p>aB</p>');
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
    TinyAssertions.assertContent(editor, '<p>aB</p>');
    editor.undoManager.transact(() => {
      const p = editor.dom.select('p')[0];
      (p.firstChild as Text).data = 'aBC';
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
    TinyAssertions.assertContent(editor, '<p><em><strong>a</strong></em></p>');
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

  it('TINY-6920: Do not fire change event at first typed character', () => {
    const editor = hook.editor();
    let changeEventCounter = 0;

    const onChange = () => {
      changeEventCounter++;
    };

    editor.resetContent('');

    editor.on('change', onChange);
    TinyContentActions.type(editor, 'A');
    editor.off('change', onChange);

    assert.equal(changeEventCounter, 0, 'No events should be detected');
  });

  context('dispatchChange', () => {
    const initialContent = '<p>some inital content</p>';
    const manualModifiedLevelContent = 'a modified last level';
    let editor: Editor;

    const assertChangeEvent = (
      event: { level: UndoLevel; lastLevel: UndoLevel | undefined } | undefined,
      expectedLevelContent: string | undefined,
      expectedLastLevelContent: string | undefined
    ) => {
      assert.equal(event?.level?.content, expectedLevelContent, 'Level has not the expected content');
      assert.equal(event?.lastLevel?.content, expectedLastLevelContent, 'Last level has not the expected content');
      assert.isDefined(event?.level.bookmark, 'Level bookmark should not be undefined');
    };

    let changeEventCounter: number;
    let currentChangeEvent: { level: UndoLevel; lastLevel: UndoLevel | undefined } | undefined;

    const onChange = (e: EditorEvent<{
      level: UndoLevel;
      lastLevel: UndoLevel | undefined;
    }>) => {
      changeEventCounter++;
      currentChangeEvent = e;
    };

    beforeEach(() => {
      changeEventCounter = 0;
      currentChangeEvent = undefined;

      editor = hook.editor();
      editor.resetContent(initialContent);
      editor.on('change', onChange);
    });

    it('TINY-8641: Dispatch change with current editor status as level and current undoManager layer as lastLevel', () => {
      assert.equal(changeEventCounter, 0, 'No events should be detected at start');

      Arr.last(editor.undoManager.data).each((lastLevel) => {
        lastLevel.content = manualModifiedLevelContent;
      });
      assert.isFalse(editor.isDirty(), 'Editor should not be dirty before dispatchChange');

      editor.undoManager.dispatchChange();

      assertChangeEvent(currentChangeEvent, initialContent, manualModifiedLevelContent);
      assert.equal(changeEventCounter, 1, '1 event should be detected');
      assert.isTrue(editor.isDirty(), 'Editor should be dirty after dispatchChange');

      editor.off('change', onChange);
    });

    it('TINY-8641: dispatchChange should always fire on empty stack with current content as level and lastLevel', () => {
      editor.undoManager.clear();
      assert.lengthOf(editor.undoManager.data, 0, 'undo manager should be empty after clear');

      editor.undoManager.dispatchChange();

      assertChangeEvent(currentChangeEvent, initialContent, undefined);

      editor.off('change', onChange);
    });
  });

  it('TINY-9222: Scroll to the cursor after undo and redo', () => {
    const editor = hook.editor();

    const height = 5000;
    editor.resetContent(`<p class="first">top paragraph</p><p style="height: ${height}px"></p><p class="last">last paragraph</p>`);
    TinySelections.select(editor, 'p.last', [ 0 ]);
    TinyContentActions.type(editor, 'updated ');

    const doc = TinyDom.document(editor);
    const editorHeight = editor.getWin().innerHeight;

    const checkScroll = (action: 'undo' | 'redo') => {
      Scroll.to(0, 0, doc);
      editor.undoManager[action]();
      assert.isAtLeast(Scroll.get(doc).top + editorHeight, height, `should scroll to the cursor after ${action}`);
    };

    Arr.each([ 'undo', 'redo' ], checkScroll);
  });

  context('Excluded content', () => {
    const testContentExclusions = (exclusions: { content: string; expected: string }[]) => () => {
      const editor = hook.editor();
      const apis = TinyApis(editor);
      let count = 0;
      let lastLevelContent: string;

      editor.undoManager.clear();
      assert.equal(count, 0);

      editor.on('AddUndo', () => count++);
      editor.on('BeforeAddUndo', (e) => {
        if (e.level.content === '' && !Type.isNull(e.level.fragments) && e.level.fragments.length > 0) {
          lastLevelContent = e.level.fragments.join('');
        } else {
          lastLevelContent = e.level.content;
        }
      });

      Arr.each(exclusions, (exclusion, i) => {
        apis.setRawContent(exclusion.content);
        editor.undoManager.add();
        assert.equal(count, i + 1);
        assert.equal(HtmlUtils.cleanHtml(lastLevelContent), exclusion.expected);
      });
    };

    it('Exclude internal elements', testContentExclusions([{
      content: 'test' +
        '<img src="about:blank" data-mce-selected="1" />' +
        '<table data-mce-selected="1"><tr><td>x</td></tr></table>',
      expected: 'test' +
      '<img src="about:blank">' +
      '<table><tbody><tr><td>x</td></tr></tbody></table>'
    }, {
      content: '<span data-mce-bogus="1">x</span>' +
        '<span data-mce-bogus="1">\uFEFF</span>' +
        '<div data-mce-bogus="all"></div>' +
        '<div data-mce-bogus="all"><div><b>x</b></div></div>' +
        '<img src="about:blank" data-mce-bogus="all">' +
        '<br data-mce-bogus="1">' +
        'test' +
        '\u200B' +
        '<img src="about:blank" />' +
        '<table><tr><td>x</td></tr></table>',
      expected: '<span data-mce-bogus="1">x</span>' +
        '<span data-mce-bogus="1"></span>' +
        '<br data-mce-bogus="1">' +
        'test' +
        '\u200B' +
        '<img src="about:blank">' +
        '<table><tbody><tr><td>x</td></tr></tbody></table>'
    }]));

    it('TINY-10180: Comment nodes containing ZWNBSP are emptied', testContentExclusions([{
      content: '<p>test0</p><!-- te\uFEFFst1 --><!-- test2 --><!-- te\uFEFFst3 -->',
      expected: '<p>test0</p><!----><!-- test2 --><!---->'
    }]));

    Arr.each([ 'noscript', 'style', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
      it(`TINY-10305: Unescaped text nodes containing ZWNBSP within ${parent} are emptied`, testContentExclusions([{
        content: `<p>test0</p><${parent}>te\uFEFFst1</${parent}><${parent}>test2</${parent}><${parent}>te\uFEFFst3</${parent}>`,
        expected: `<p>test0</p><${parent}></${parent}><${parent}>test2</${parent}><${parent}></${parent}>`
      }]));
    });

    it('TINY-10305: Unescaped text nodes containing ZWNBSP within plaintext are emptied', testContentExclusions([{
      content: '<p>test0</p><plaintext>te\uFEFFst1 test2<p>te\uFEFFst3</p>',
      expected: '<p>test0</p><plaintext></plaintext>'
    }]));
  });

  context('Content XSS', () => {
    const xssFnName = 'xssfn';

    const addAndRestoreLevel = (editor: Editor, apis: TinyApis, levelContent: string) => {
      editor.undoManager.clear();
      apis.setRawContent(levelContent);
      editor.undoManager.add();
      apis.setRawContent('<p>another level</p>');
      editor.undoManager.add();
      editor.undoManager.undo();
    };

    const testContentMxssOnRestore = (content: string) => () => {
      const editor = hook.editor();
      const apis = TinyApis(editor);
      let hasXssOccurred = false;
      (editor.getWin() as any)[xssFnName] = () => hasXssOccurred = true;
      addAndRestoreLevel(editor, apis, content);
      assert.isFalse(hasXssOccurred, 'XSS should not have occurred');
      (editor.getWin() as any)[xssFnName] = null;
    };

    it('TINY-10180: Excluding data-mce-bogus="all" elements does not cause mXSS',
      testContentMxssOnRestore(`<!--<br data-mce-bogus="all">><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10180: Excluding temporary attributes does not cause mXSS',
      testContentMxssOnRestore(`<!--data-mce-selected="x"><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10180: Excluding ZWNBSP in comments does not cause mXSS',
      testContentMxssOnRestore(`<!--\uFEFF><iframe onload="window.${xssFnName}();">->`));

    Arr.each([ 'noscript', 'style', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
      it(`TINY-10305: Excluding ZWNBSP in ${parent} does not cause mXSS`,
        testContentMxssOnRestore(`<${parent}><\uFEFF/${parent}><\uFEFFiframe onload="window.${xssFnName}();"></${parent}>`));
    });
  });
});
