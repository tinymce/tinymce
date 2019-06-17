import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import HtmlUtils from '../module/test/HtmlUtils';
import KeyUtils from '../module/test/KeyUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.UndoManager', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const ok = function (value, label?) {
    return LegacyUnit.equal(value, true, label);
  };

  suite.test('Initial states', function (editor) {
    ok(!editor.undoManager.hasUndo());
    ok(!editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('One undo level', function (editor) {
    editor.undoManager.clear();
    editor.setContent('test');

    editor.focus();
    editor.execCommand('SelectAll');
    editor.execCommand('Bold');

    ok(editor.undoManager.hasUndo());
    ok(!editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('Two undo levels', function (editor) {
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');

    ok(editor.undoManager.hasUndo());
    ok(!editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('No undo levels and one redo', function (editor) {
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.undoManager.undo();

    ok(!editor.undoManager.hasUndo());
    ok(editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('One undo levels and one redo', function (editor) {
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');
    editor.undoManager.undo();

    ok(editor.undoManager.hasUndo());
    ok(editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('Typing state', function (editor) {
    let selectAllFlags;

    editor.undoManager.clear();
    editor.setContent('test');

    ok(!editor.undoManager.typing);

    editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 65 });
    ok(editor.undoManager.typing);

    editor.dom.fire(editor.getBody(), 'keydown', { keyCode: 13 });
    ok(!editor.undoManager.typing);

    selectAllFlags = { keyCode: 65, ctrlKey: false, altKey: false, shiftKey: false };

    if (Env.mac) {
      selectAllFlags.metaKey = true;
    } else {
      selectAllFlags.ctrlKey = true;
    }

    editor.dom.fire(editor.getBody(), 'keydown', selectAllFlags);
    ok(!editor.undoManager.typing);
  });

  suite.test('Undo and add new level', function (editor) {
    editor.undoManager.clear();
    editor.setContent('test');

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    editor.undoManager.undo();
    editor.execCommand('SelectAll');
    editor.execCommand('Italic');

    ok(editor.undoManager.hasUndo());
    ok(!editor.undoManager.hasRedo());
    ok(!editor.undoManager.typing);
  });

  suite.test('Events', function (editor) {
    let add, undo, redo;

    editor.undoManager.clear();
    editor.setContent('test');

    editor.on('AddUndo', function (e) {
      add = e.level;
    });

    editor.on('Undo', function (e) {
      undo = e.level;
    });

    editor.on('Redo', function (e) {
      redo = e.level;
    });

    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    ok(!!add.content);
    ok(!!add.bookmark);

    editor.undoManager.undo();
    ok(!!undo.content);
    ok(!!undo.bookmark);

    editor.undoManager.redo();
    ok(!!redo.content);
    ok(!!redo.bookmark);
  });

  suite.test('No undo/redo cmds on Undo/Redo shortcut', function (editor) {
    let evt;
    const commands = [];
    let added = false;

    editor.undoManager.clear();
    editor.setContent('test');

    editor.on('BeforeExecCommand', function (e) {
      commands.push(e.command);
    });

    editor.on('BeforeAddUndo', function () {
      added = true;
    });

    evt = {
      keyCode: 90,
      metaKey: Env.mac,
      ctrlKey: !Env.mac,
      shiftKey: false,
      altKey: false
    };

    editor.dom.fire(editor.getBody(), 'keydown', evt);
    editor.dom.fire(editor.getBody(), 'keypress', evt);
    editor.dom.fire(editor.getBody(), 'keyup', evt);

    LegacyUnit.strictEqual(added, false);
    LegacyUnit.deepEqual(commands, ['Undo']);
  });

  suite.test('Transact', function (editor) {
    let count = 0, level;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', function () {
      count++;
    });

    level = editor.undoManager.transact(function () {
      editor.undoManager.add();
      editor.undoManager.add();
    });

    LegacyUnit.equal(count, 1);
    LegacyUnit.equal(level !== null, true);
  });

  suite.test('Transact no change', function (editor) {
    editor.undoManager.add();

    const level = editor.undoManager.transact(function () {
    });

    LegacyUnit.equal(level, null);
  });

  suite.test('Transact with change', function (editor) {
    editor.undoManager.add();

    const level = editor.undoManager.transact(function () {
      editor.setContent('x');
    });

    LegacyUnit.equal(level !== null, true);
  });

  suite.test('Transact nested', function (editor) {
    let count = 0;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', function () {
      count++;
    });

    editor.undoManager.transact(function () {
      editor.undoManager.add();

      editor.undoManager.transact(function () {
        editor.undoManager.add();
      });
    });

    LegacyUnit.equal(count, 1);
  });

  suite.test('Transact exception', function (editor) {
    let count = 0;

    editor.undoManager.clear();

    editor.on('BeforeAddUndo', function () {
      count++;
    });

    try {
      editor.undoManager.transact(function () {
        throw new Error('Test');
      });

      LegacyUnit.equal(true, false, 'Should never get here!');
    } catch (ex) {
      LegacyUnit.equal(ex.message, 'Test');
    }

    editor.undoManager.add();

    LegacyUnit.equal(count, 1);
  });

  suite.test('Extra with changes', function (editor) {
    let data;

    editor.undoManager.clear();
    editor.setContent('<p>abc</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.undoManager.add();

    editor.undoManager.extra(function () {
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
      editor.insertContent('1');
    }, function () {
      LegacyUnit.setSelection(editor, 'p', 1, 'p', 2);
      editor.insertContent('2');
    });

    data = editor.undoManager.data;
    LegacyUnit.equal(data.length, 3);
    LegacyUnit.equal(data[0].content, '<p>abc</p>');
    LegacyUnit.deepEqual(data[0].bookmark, { start: [0, 0, 0] });
    LegacyUnit.deepEqual(data[0].beforeBookmark, { start: [0, 0, 0] });
    LegacyUnit.equal(data[1].content, '<p>a1c</p>');
    LegacyUnit.deepEqual(data[1].bookmark, { start: [2, 0, 0] });
    LegacyUnit.deepEqual(data[1].beforeBookmark, { start: [2, 0, 0] });
    LegacyUnit.equal(data[2].content, '<p>a2c</p>');
    LegacyUnit.deepEqual(data[2].bookmark, { start: [2, 0, 0] });
    LegacyUnit.deepEqual(data[1].beforeBookmark, data[2].bookmark);
  });

  suite.test('Exclude internal elements', function (editor) {
    let count = 0, lastLevel;

    editor.undoManager.clear();
    LegacyUnit.equal(count, 0);

    editor.on('AddUndo', function () {
      count++;
    });

    editor.on('BeforeAddUndo', function (e) {
      lastLevel = e.level;
    });

    editor.getBody().innerHTML = (
      'test' +
      '<img src="about:blank" data-mce-selected="1" />' +
      '<table data-mce-selected="1"><tr><td>x</td></tr></table>'
    );

    editor.undoManager.add();
    LegacyUnit.equal(count, 1);
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastLevel.content),
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
    LegacyUnit.equal(count, 2);
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastLevel.content),
      '<span data-mce-bogus="1">x</span>' +
      '<span data-mce-bogus="1"></span>' +
      '<br data-mce-bogus="1">' +
      'test' +
      '\u200B' +
      '<img src="about:blank">' +
      '<table><tbody><tr><td>x</td></tr></tbody></table>'
    );
  });

  suite.test('Undo added when typing and losing focus', function (editor) {
    let lastLevel;

    editor.on('BeforeAddUndo', function (e) {
      lastLevel = e.level;
    });

    editor.undoManager.clear();
    editor.setContent('<p>some text</p>');
    LegacyUnit.setSelection(editor, 'p', 4, 'p', 9);
    KeyUtils.type(editor, '\b');

    LegacyUnit.equal(HtmlUtils.cleanHtml(lastLevel.content), '<p>some text</p>');
    editor.fire('blur');
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastLevel.content), '<p>some</p>');

    editor.execCommand('FormatBlock', false, 'h1');
    editor.undoManager.undo();
    LegacyUnit.equal(editor.getContent(), '<p>some</p>');
  });

  suite.test('BeforeAddUndo event', function (editor) {
    let lastEvt, addUndoEvt;

    const blockEvent = function (e) {
      e.preventDefault();
    };

    editor.on('BeforeAddUndo', function (e) {
      lastEvt = e;
    });

    editor.undoManager.clear();
    editor.setContent('<p>a</p>');
    editor.undoManager.add();

    LegacyUnit.equal(lastEvt.lastLevel, undefined);
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>a</p>');

    editor.setContent('<p>b</p>');
    editor.undoManager.add();

    LegacyUnit.equal(HtmlUtils.cleanHtml(lastEvt.lastLevel.content), '<p>a</p>');
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>b</p>');

    editor.on('BeforeAddUndo', blockEvent);

    editor.on('AddUndo', function (e) {
      addUndoEvt = e;
    });

    editor.setContent('<p>c</p>');
    editor.undoManager.add(null, { data: 1 });

    LegacyUnit.equal(HtmlUtils.cleanHtml(lastEvt.lastLevel.content), '<p>b</p>');
    LegacyUnit.equal(HtmlUtils.cleanHtml(lastEvt.level.content), '<p>c</p>');
    LegacyUnit.equal(lastEvt.originalEvent.data, 1);
    ok(!addUndoEvt, 'Event level produced when it should be blocked');

    editor.off('BeforeAddUndo', blockEvent);
  });

  suite.test('Dirty state type letter', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    ok(!editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, 'b');
    LegacyUnit.equal(editor.getContent(), '<p>ab</p>');
    ok(editor.isDirty(), 'Dirty state should be true');
  });

  suite.test('Dirty state type shift+letter', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    ok(!editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, { keyCode: 65, charCode: 66, shiftKey: true });
    LegacyUnit.equal(editor.getContent(), '<p>aB</p>');
    ok(editor.isDirty(), 'Dirty state should be true');
  });

  suite.test('Dirty state type AltGr+letter', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    ok(!editor.isDirty(), 'Dirty state should be false');
    KeyUtils.type(editor, { keyCode: 65, charCode: 66, ctrlKey: true, altKey: true });
    LegacyUnit.equal(editor.getContent(), '<p>aB</p>');
    ok(editor.isDirty(), 'Dirty state should be true');
  });

  suite.test('ExecCommand while typing should produce undo level', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    LegacyUnit.equal(editor.undoManager.typing, false);
    KeyUtils.type(editor, { keyCode: 66, charCode: 66 });
    LegacyUnit.equal(editor.undoManager.typing, true);
    LegacyUnit.equal(editor.getContent(), '<p>aB</p>');
    editor.execCommand('mceInsertContent', false, 'C');
    LegacyUnit.equal(editor.undoManager.typing, false);
    LegacyUnit.equal(editor.undoManager.data.length, 3);
    LegacyUnit.equal(editor.undoManager.data[0].content, '<p>a</p>');
    LegacyUnit.equal(editor.undoManager.data[1].content, '<p>aB</p>');
    LegacyUnit.equal(editor.undoManager.data[2].content, '<p>aBC</p>');
  });

  suite.test('transact while typing should produce undo level', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 1);

    LegacyUnit.equal(editor.undoManager.typing, false);
    KeyUtils.type(editor, { keyCode: 66, charCode: 66 });
    LegacyUnit.equal(editor.undoManager.typing, true);
    LegacyUnit.equal(editor.getContent(), '<p>aB</p>');
    editor.undoManager.transact(function () {
      editor.getBody().firstChild.firstChild.data = 'aBC';
    });
    LegacyUnit.equal(editor.undoManager.typing, false);
    LegacyUnit.equal(editor.undoManager.data.length, 3);
    LegacyUnit.equal(editor.undoManager.data[0].content, '<p>a</p>');
    LegacyUnit.equal(editor.undoManager.data[1].content, '<p>aB</p>');
    LegacyUnit.equal(editor.undoManager.data[2].content, '<p>aBC</p>');
  });

  suite.test('ignore does a transaction but no levels', function (editor) {
    editor.undoManager.clear();
    editor.setDirty(false);
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    editor.undoManager.typing = true;

    editor.undoManager.ignore(function () {
      editor.execCommand('bold');
      editor.execCommand('italic');
    });

    LegacyUnit.equal(editor.undoManager.typing, true);
    LegacyUnit.equal(editor.undoManager.data.length, 0);
    LegacyUnit.equal(editor.getContent(), '<p><em><strong>a</strong></em></p>');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
