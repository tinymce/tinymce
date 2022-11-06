import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as HtmlUtils from '../../module/test/HtmlUtils';

describe('browser.tinymce.core.keyboard.EnterKeyCeFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    schema: 'html5',
    extended_valid_elements: 'div[id|style|contenteditable],span[id|style|contenteditable],#dt,#dd',
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const pressEnter = (editor: Editor, evt?: any) => {
    const dom = editor.dom;
    const target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13 }, evt);

    dom.dispatch(target, 'keydown', evt);
    dom.dispatch(target, 'keypress', evt);
    dom.dispatch(target, 'keyup', evt);
  };

  it('Enter in text within contentEditable:true h1 inside contentEditable:false div', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>';
    LegacyUnit.setSelection(editor, 'div h1', 1);
    pressEnter(editor);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<div contenteditable="false"><h1 contenteditable="true">ab</h1></div>'
    );
  });

  it('Enter before cE=false div', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
    editor.selection.select(editor.dom.select('div')[0]);
    editor.selection.collapse(true);
    pressEnter(editor);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<p><br data-mce-bogus="1"></p><div contenteditable="false">x</div>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Enter after cE=false div', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<div contenteditable="false">x</div>';
    editor.selection.select(editor.dom.select('div')[0]);
    editor.selection.collapse(false);
    pressEnter(editor);
    assert.equal(
      HtmlUtils.cleanHtml(editor.getBody().innerHTML),
      '<div contenteditable="false">x</div><p><br data-mce-bogus="1"></p>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TINY-9098: Enter key on inline cE=false should do nothing', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">x</span></p>');
    TinySelections.select(editor, 'span', []);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">x</span></p>');
    assert.equal(editor.selection.getNode().nodeName, 'SPAN');
  });

  it('TINY-9101: Pressing Enter on a cE=false block should do nothing', () => {
    const editor = hook.editor();
    editor.setContent('<p>First</p><p contenteditable="false">Second</p><p>Third</p>');
    TinySelections.select(editor, 'p:eq(1)', [ ]);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<p>First</p><p contenteditable="false">Second</p><p>Third</p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TINY-9101: Pressing Enter on a cE=false pre should do nothing', () => {
    const editor = hook.editor();
    editor.setContent('<p>First</p><pre contenteditable="false">Second</pre><p>Third</p>');
    TinySelections.select(editor, 'pre', [ ]);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<p>First</p><pre contenteditable="false">Second</pre><p>Third</p>');
    assert.equal(editor.selection.getNode().nodeName, 'PRE');
  });

  it('TINY-9101: Enter after selecting across paragraphs before a cE=false span should not delete cE=false span', () => {
    const editor = hook.editor();
    editor.setContent('<p>first</p><p>second<span contenteditable="false">2</span></p>');
    // Select across the two paragraphs, but stop before the cef span
    TinySelections.setSelection(editor, [ 0, 0 ], 'fir'.length, [ 1, 0 ], 'sec'.length);
    pressEnter(editor);
    TinyAssertions.assertContent(editor, '<p>fir</p><p>ond<span contenteditable="false">2</span></p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });
});
