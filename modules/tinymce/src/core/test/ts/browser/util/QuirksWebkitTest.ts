import { before, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.util.QuirksWebkitTest', () => {
  before(function () {
    if (!Env.browser.isChromium() && !Env.browser.isSafari()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    disable_nodechange: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('Delete from beginning of P into H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>ab</h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Delete between empty paragraphs', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p><p><br></p><p><br></p><p>b</p>';
    LegacyUnit.setSelection(editor, 'p:last-of-type', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertRawContent(editor, '<p>a</p><p><br></p><p>b</p>');
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('Delete range from middle of H1 to middle of span in P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>ab</h1><p>b<span style="color:red">cd</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1, 'span', 1);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">d</span></h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Delete from beginning of P with style span inside into H1 with inline block', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<input type="text"></h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>a<input type="text">b<span style="color: red;">c</span></h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Delete from beginning of P with style span inside into H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>ab<span style="color: red;">c</span></h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Delete from beginning of P into H1 with contentEditable:false', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1 contentEditable="false">a</h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1 contenteditable="false">a</h1><p>b<span style="color: red;">c</span></p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('Delete from beginning of P with style span inside into H1 with trailing BR', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<br></h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>ab<span style="color: red;">c</span></h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Delete from empty P with style span inside into H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Delete from beginning of P with span style to H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Delete from beginning of P with BR line to H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b<br>c</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    TinyAssertions.assertContent(editor, '<h1>ab<br>c</h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Delete from after image to paragraph', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>a</p><p><img src="about:blank"></p>';
    const rng = editor.dom.createRng();
    rng.setStartAfter(editor.dom.select('img')[0]);
    rng.setEndAfter(editor.dom.select('img')[0]);
    editor.selection.setRng(rng);
    editor.execCommand('Delete');
    TinyAssertions.assertRawContent(editor, '<p>a</p><p><br></p>');
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('ForwardDelete from end of H1 to P with style span', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 with trailing BR to P with style span', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a<span style="color: red;">b</span></h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 with two trailing BR:s to P with style span', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<br><br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a</h1><p><span style="color: red;">b</span></p>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 to P with style and inline block element', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p><input type="text"><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a<input type="text"><span style="color: red;">b</span></h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 with BR line to P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a<br>b</h1><p>c</p>';

    const rng = editor.selection.getRng();
    rng.setStart(editor.dom.select('h1')[0].lastChild as Text, 1);
    rng.setEnd(editor.dom.select('h1')[0].lastChild as Text, 1);
    editor.selection.setRng(rng);

    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a<br>bc</h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 into P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>ab</h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('ForwardDelete from end of H1 into P with contentEditable:false', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p contentEditable="false">b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>a</h1><p contenteditable="false">b</p>');
  });

  it('ForwardDelete from end of H1 into P with style span inside', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b<span style="color: #010203">c</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    TinyAssertions.assertContent(editor, '<h1>ab<span style="color: #010203;">c</span></h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });

  it('Backspace key from beginning of P into H1', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.dispatch('keydown', { keyCode: 8, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false } as KeyboardEvent);
    TinyAssertions.assertContent(editor, '<h1>ab</h1>');
    assert.equal(editor.selection.getNode().nodeName, 'H1');
  });

  it('Delete key from end of H1 into P', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.dispatch('keydown', { keyCode: 46, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false } as KeyboardEvent);
    TinyAssertions.assertContent(editor, '<h1>ab</h1>');
    assert.equal(editor.selection.getStart().nodeName, 'H1');
  });
  /*
      // These used to be supported in the Quirks branch however not sure if
      // we need to deal with this very uncommon operations. If we do we need
      // to re-introduce them in the new Backspace/Delete logic

      it('Backspace previous word', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 7);
        editor.fire("keydown", { keyCode: 8, ctrlKey: true });
        TinyAssertions.assertContent(editor, '<p>abc&nbsp;</p>');
        assert.equal(editor.selection.getStart().nodeName, 'P');
      });

      it('Backspace previous line', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 7);
        editor.fire("keydown", { keyCode: 8, metaKey: true });
       TinyAssertions.assertContent(editor, '<p><br></p>');
        assert.equal(editor.selection.getStart().nodeName, 'BR');
      });

      it('Delete next word', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 0);
        editor.dispatch("keydown", { keyCode: 46, ctrlKey: true });

        // Remove nbsp since very old WebKit has an slight issue
        assert.equal(editor.getContent().replace('&nbsp;', ''), '<p>123</p>');
        assert.equal(editor.selection.getStart().nodeName, 'P');
      });

      it('Delete next line', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 0);
        editor.fire("keydown", { keyCode: 46, metaKey: true });
        TinyAssertions.assertContent(editor, '<p><br></p>');
        assert.equal(editor.selection.getStart().nodeName, 'BR');
      });

      it('Type over bold text in fully selected block and keep bold', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p><i><b>x</b></i></p><p>y</p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        TinyAssertions.assertContent(editor, '<p><i><b>a</b></i></p><p>y</p>');
        assert.equal(editor.selection.getStart().nodeName, 'B');
      });

      it('Type over partial bold text and keep bold', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p><b>xy</b></p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        TinyAssertions.assertContent(editor, '<p><b>ay</b></p>');
        assert.equal(editor.selection.getStart().nodeName, 'B');
      });

      it('Type over bold text wrapped inside other formats', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p><i>1<b>2</b>3</i></p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        TinyAssertions.assertContent(editor, '<p><i>1<b>a</b>3</i></p>');
        assert.equal(editor.selection.getStart().nodeName, 'B');
      });

      it('Delete last character in formats', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p><b><i>b</i></b></p>';
        LegacyUnit.setSelection(editor, 'i', 1);
        editor.fire("keydown", { keyCode: 8 });
        TinyAssertions.assertContent(editor, '<p><b><i><br></i></b></p>');
        assert.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      it('ForwardDelete last character in formats', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p><b><i>b</i></b></p>';
        LegacyUnit.setSelection(editor, 'i', 0);
        editor.fire("keydown", { keyCode: 46 });
        TinyAssertions.assertContent(editor, '<p><b><i><br></i></b></p>');
        assert.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      it('Delete in empty in formats text block', () => {
        const editor = hook.editor();
        var rng;

        editor.getBody().innerHTML = '<p>a</p><p><b><i><br></i></b></p><p><b><i><br></i></b></p>';
        rng = editor.dom.createRng();
        rng.setStartBefore(editor.$('br:last')[0]);
        rng.setEndBefore(editor.$('br:last')[0]);
        editor.selection.setRng(rng);
        editor.fire("keydown", { keyCode: 8 });
        TinyAssertions.assertContent(editor, '<p>a</p><p><b><i><br></i></b></p>');
        assert.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      it('ForwardDelete in empty formats text block', () => {
        const editor = hook.editor();
        var rng;

        editor.getBody().innerHTML = '<p>a</p><p><b><i><br></i></b></p><p><b><i><br></i></b></p>';
        rng = editor.dom.createRng();
        rng.setStartBefore(editor.$('br:first')[0]);
        rng.setEndBefore(editor.$('br:first')[0]);
        editor.selection.setRng(rng);
        editor.fire("keydown", { keyCode: 46 });
        TinyAssertions.assertContent(editor, '<p>a</p><p><b><i><br></i></b></p>');
        assert.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      it('Type over all contents', () => {
        const editor = hook.editor();
        editor.getBody().innerHTML = '<p>abc</p>';
        LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
        editor.fire('keypress', { charCode: 97 });
        TinyAssertions.assertContent(editor, '<p>a</p>');
        assert.equal(editor.selection.getRng().startContainer.data, 'a');
        assert.equal(editor.selection.getRng().startOffset, 1);
      });
  */
  it('ForwardDelete all contents', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.dispatch('keydown', { keyCode: 46 } as KeyboardEvent);
    TinyAssertions.assertRawContent(editor, '<p><br data-mce-bogus="1"></p>');
    assert.equal(editor.selection.getStart(true).nodeName, 'P');
  });

  it('Delete all contents', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.dispatch('keydown', { keyCode: 8 } as KeyboardEvent);
    TinyAssertions.assertRawContent(editor, '<p><br data-mce-bogus="1"></p>');
    assert.equal(editor.selection.getStart(true).nodeName, 'P');
  });
});
