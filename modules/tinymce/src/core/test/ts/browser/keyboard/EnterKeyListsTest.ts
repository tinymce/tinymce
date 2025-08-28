import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

describe('browser.tinymce.core.keyboard.EnterKeyListsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    schema: 'html5',
    extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
    entities: 'raw',
    indent: false,
    text_patterns: false, // TODO TINY-8341 investigate why this is needed
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const pressEnter = (editor: Editor, evt?: any) => {
    const dom = editor.dom;
    const target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13, shiftKey: false }, evt);

    dom.dispatch(target, 'keydown', evt);
    dom.dispatch(target, 'keypress', evt);
    dom.dispatch(target, 'keyup', evt);
  };

  const trimBrsOnIE = (html: string) => {
    return html.replace(/<br[^>]*>/gi, '');
  };

  it('Enter inside empty li in beginning of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><br></li><li>a</li></ol>';
    LegacyUnit.setSelection(editor, 'li', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<p>\u00a0</p><ol><li>a</li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside empty li at the end of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li></ol>';
    LegacyUnit.setSelection(editor, 'li:last-of-type', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<ol><li>a</li></ol><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Shift+Enter inside empty li in the middle of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li><li>b</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li:nth-child(2)')[0], 0);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertRawContent(editor, '<ol><li>a</li><li><br><br></li><li>b</li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Shift+Enter inside empty li in beginning of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><br></li><li>a</li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[0], 0);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertRawContent(editor, '<ol><li><br><br></li><li>a</li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Shift+Enter inside empty li at the end of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li></ol>';
    editor.selection.setCursorLocation(editor.dom.select('li')[1], 0);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertRawContent(editor, '<ol><li>a</li><li><br><br></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty li in the middle of ol', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li>a</li><li><br></li><li>b</li></ol>';
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<ol><li>a</li></ol><p>\u00a0</p><ol><li>b</li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  // Nested lists in LI elements

  it('Enter inside empty LI in beginning of OL in LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li><br></li>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty LI in middle of OL in LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '<li>\u00a0' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty LI in end of OL in LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:last-of-type', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '<li>\u00a0</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  // Nested lists in OL elements

  it('Enter before nested list', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol > li', 1);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>\u00a0' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty LI in beginning of OL in OL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li><br></li>' +
      '<li>a</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>\u00a0</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty LI in middle of OL in OL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(2)', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<li>\u00a0</li>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter inside empty LI in end of OL in OL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = trimBrsOnIE(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:last-of-type', 0);
    editor.focus();
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<li>\u00a0</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Enter at beginning of first DT inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dt>\u00a0</dt><dt>a</dt></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DT');
  });

  it('Enter at beginning of first DD inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dd>\u00a0</dd><dd>a</dd></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DD');
  });

  it('Enter at beginning of middle DT inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dt>a</dt><dt>b</dt><dt>c</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt:nth-child(2)', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dt>a</dt><dt>\u00a0</dt><dt>b</dt><dt>c</dt></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DT');
  });

  it('Enter at beginning of middle DD inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dd>a</dd><dd>b</dd><dd>c</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd:nth-child(2)', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dd>a</dd><dd>\u00a0</dd><dd>b</dd><dd>c</dd></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DD');
  });

  it('Enter at end of last DT inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dt>a</dt></dl>';
    LegacyUnit.setSelection(editor, 'dt', 1);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dt>a</dt><dt>\u00a0</dt></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DT');
  });

  it('Enter at end of last DD inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dd>a</dd></dl>';
    LegacyUnit.setSelection(editor, 'dd', 1);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dd>a</dd><dd>\u00a0</dd></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DD');
  });

  it('Enter at end of last empty DT inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dt>a</dt><dt></dt></dl>';
    LegacyUnit.setSelection(editor, 'dt:nth-child(2)', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dt>a</dt></dl><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter at end of last empty DD inside DL', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<dl><dd>a</dd><dd></dd></dl>';
    LegacyUnit.setSelection(editor, 'dd:nth-child(2)', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<dl><dd>a</dd></dl><p>\u00a0</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter at beginning of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<ol><li>\u00a0</li><li><p>abcd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter inside middle of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<ol><li><p>ab</p></li><li><p>cd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter at end of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<ol><li><p>abcd</p></li><li>\u00a0</li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Shift+Enter at beginning of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<ol><li><p><br>abcd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Shift+Enter inside middle of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertContent(editor, '<ol><li><p>ab<br>cd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Shift+Enter at end of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, { shiftKey: true });
    TinyAssertions.assertContent(
      editor,
      '<ol><li><p>abcd<br><br></p></li></ol>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Ctrl+Enter at beginning of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 0);
    pressEnter(editor, { ctrlKey: true });
    TinyAssertions.assertContent(editor, '<ol><li><p>\u00a0</p><p>abcd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Ctrl+Enter inside middle of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 2);
    pressEnter(editor, { ctrlKey: true });
    TinyAssertions.assertContent(editor, '<ol><li><p>ab</p><p>cd</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Ctrl+Enter at end of P inside LI', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<ol><li><p>abcd</p></li></ol>';
    LegacyUnit.setSelection(editor, 'p', 4);
    pressEnter(editor, { ctrlKey: true });
    TinyAssertions.assertContent(editor, '<ol><li><p>abcd</p><p>\u00a0</p></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TINY-5974: Should be able to outdent empty list using enter key', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>' +
          'a' +
          '<ul>' +
            '<li>\u00a0</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
    TinyContentActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>a</li>' +
        '<li>\u00a0</li>' +
      '</ul>'
    );
  });

  it('TINY-5974: Should be able to outdent empty nested list using enter key', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>a' +
            '<ul>' +
              '<li style="list-style-type: none;">' +
                '<ul>' +
                  '<li>\u00a0</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0, 0 ], 0);
    TinyContentActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>a' +
          '<ul>' +
            '<li>\u00a0</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });
});
