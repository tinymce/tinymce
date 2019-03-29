import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import HtmlUtils from '../../module/test/HtmlUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.util.QuirksWekbitTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('Delete from beginning of P into H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Delete between empty paragraphs', function (editor) {
    editor.getBody().innerHTML = '<p>a</p><p><br></p><p><br></p><p>b</p>';
    LegacyUnit.setSelection(editor, 'p:last', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)), '<p>a</p><p><br /></p><p>b</p>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('Delete range from middle of H1 to middle of span in P', function (editor) {
    editor.getBody().innerHTML = '<h1>ab</h1><p>b<span style="color:red">cd</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1, 'span', 1);
    editor.execCommand('Delete');
    LegacyUnit.equal(
      HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)),
      '<h1>a<span style="color: red;">d</span></h1>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Delete from beginning of P with style span inside into H1 with inline block', function (editor) {
    editor.getBody().innerHTML = '<h1>a<input type="text"></h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<input type="text" />b<span style="color: red;">c</span></h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('Delete from beginning of P with style span inside into H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1>ab<span style="color: red;">c</span></h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Delete from beginning of P into H1 with contentEditable:false', function (editor) {
    editor.getBody().innerHTML = '<h1 contentEditable="false">a</h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1 contenteditable="false">a</h1><p>b<span style="color: red;">c</span></p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('Delete from beginning of P with style span inside into H1 with trailing BR', function (editor) {
    editor.getBody().innerHTML = '<h1>a<br></h1><p>b<span style="color:red">c</span></p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1>ab<span style="color: red;">c</span></h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Delete from empty P with style span inside into H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a<br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<span style="color: red;">b</span></h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('Delete from beginning of P with span style to H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'span', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<span style="color: red;">b</span></h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('Delete from beginning of P with BR line to H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b<br>c</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('Delete');
    LegacyUnit.equal(HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)), '<h1>ab<br />c</h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Delete from after image to paragraph', function (editor) {
    editor.getBody().innerHTML = '<p>a</p><p><img src="about:blank"></p>';
    const rng = editor.dom.createRng();
    rng.setStartAfter(editor.dom.select('img')[0]);
    rng.setEndAfter(editor.dom.select('img')[0]);
    editor.selection.setRng(rng);
    editor.execCommand('Delete');
    LegacyUnit.equal(HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)), '<p>a</p><p><br /></p>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('ForwardDelete from end of H1 to P with style span', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<span style="color: red;">b</span></h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 with trailing BR to P with style span', function (editor) {
    editor.getBody().innerHTML = '<h1>a<br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<span style="color: red;">b</span></h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 with two trailing BR:s to P with style span', function (editor) {
    editor.getBody().innerHTML = '<h1>a<br><br></h1><p><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>a</h1><p><span style="color: red;">b</span></p>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 to P with style and inline block element', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p><input type="text"><span style="color:red">b</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>a<input type="text" /><span style="color: red;">b</span></h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 with BR line to P', function (editor) {
    editor.getBody().innerHTML = '<h1>a<br>b</h1><p>c</p>';

    const rng = editor.selection.getRng();
    rng.setStart(editor.$('h1')[0].lastChild, 1);
    rng.setEnd(editor.$('h1')[0].lastChild, 1);
    editor.selection.setRng(rng);

    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(HtmlUtils.normalizeHtml(HtmlUtils.cleanHtml(editor.getBody().innerHTML)), '<h1>a<br />bc</h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 into P', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('ForwardDelete from end of H1 into P with contentEditable:false', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p contentEditable="false">b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>a</h1><p contenteditable="false">b</p>');
  });

  suite.test('ForwardDelete from end of H1 into P with style span inside', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b<span style="color: #010203">c</span></p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.execCommand('ForwardDelete');
    LegacyUnit.equal(editor.getContent(), '<h1>ab<span style="color: #010203;">c</span></h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });

  suite.test('Backspace key from beginning of P into H1', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.fire('keydown', { keyCode: 8, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false });
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'H1');
  });

  suite.test('Delete key from end of H1 into P', function (editor) {
    editor.getBody().innerHTML = '<h1>a</h1><p>b</p>';
    LegacyUnit.setSelection(editor, 'h1', 1);
    editor.fire('keydown', { keyCode: 46, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false });
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<h1>ab</h1>');
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'H1');
  });
  /*
      // These used to be supported in the Quirks branch however not sure if
      // we need to deal with this very uncommon operations. If we do we need
      // to re-introduce them in the new Backspace/Delete logic

      suite.test('Backspace previous word', function (editor) {
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 7);
        editor.fire("keydown", { keyCode: 8, ctrlKey: true });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>abc&nbsp;</p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
      });

      suite.test('Backspace previous line', function (editor) {
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 7);
        editor.fire("keydown", { keyCode: 8, metaKey: true });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><br></p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'BR');
      });

      suite.test('Delete next word', function (editor) {
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 0);
        editor.fire("keydown", { keyCode: 46, ctrlKey: true });

        // Remove nbsp since very old WebKit has an slight issue
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML).replace('&nbsp;', ''), '<p>123</p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
      });

      suite.test('Delete next line', function (editor) {
        editor.getBody().innerHTML = '<p>abc 123</p>';
        LegacyUnit.setSelection(editor, 'p', 0);
        editor.fire("keydown", { keyCode: 46, metaKey: true });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><br></p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'BR');
      });

      suite.test('Type over bold text in fully selected block and keep bold', function (editor) {
        editor.getBody().innerHTML = '<p><i><b>x</b></i></p><p>y</p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><i><b>a</b></i></p><p>y</p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'B');
      });

      suite.test('Type over partial bold text and keep bold', function (editor) {
        editor.getBody().innerHTML = '<p><b>xy</b></p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><b>ay</b></p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'B');
      });

      suite.test('Type over bold text wrapped inside other formats', function (editor) {
        editor.getBody().innerHTML = '<p><i>1<b>2</b>3</i></p>';
        LegacyUnit.setSelection(editor, 'b', 0, 'b', 1);
        editor.fire("keypress", { keyCode: 65, charCode: 65 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><i>1<b>a</b>3</i></p>');
        LegacyUnit.equal(editor.selection.getStart().nodeName, 'B');
      });

      suite.test('Delete last character in formats', function (editor) {
        editor.getBody().innerHTML = '<p><b><i>b</i></b></p>';
        LegacyUnit.setSelection(editor, 'i', 1);
        editor.fire("keydown", { keyCode: 8 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><b><i><br></i></b></p>');
        LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      suite.test('ForwardDelete last character in formats', function (editor) {
        editor.getBody().innerHTML = '<p><b><i>b</i></b></p>';
        LegacyUnit.setSelection(editor, 'i', 0);
        editor.fire("keydown", { keyCode: 46 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><b><i><br></i></b></p>');
        LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      suite.test('Delete in empty in formats text block', function (editor) {
        var rng;

        editor.getBody().innerHTML = '<p>a</p><p><b><i><br></i></b></p><p><b><i><br></i></b></p>';
        rng = editor.dom.createRng();
        rng.setStartBefore(editor.$('br:last')[0]);
        rng.setEndBefore(editor.$('br:last')[0]);
        editor.selection.setRng(rng);
        editor.fire("keydown", { keyCode: 8 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>a</p><p><b><i><br></i></b></p>');
        LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      suite.test('ForwardDelete in empty formats text block', function (editor) {
        var rng;

        editor.getBody().innerHTML = '<p>a</p><p><b><i><br></i></b></p><p><b><i><br></i></b></p>';
        rng = editor.dom.createRng();
        rng.setStartBefore(editor.$('br:first')[0]);
        rng.setEndBefore(editor.$('br:first')[0]);
        editor.selection.setRng(rng);
        editor.fire("keydown", { keyCode: 46 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>a</p><p><b><i><br></i></b></p>');
        LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'I');
      });

      suite.test('Type over all contents', function (editor) {
        editor.getBody().innerHTML = '<p>abc</p>';
        LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
        editor.fire('keypress', { charCode: 97 });
        LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>a</p>');
        LegacyUnit.equal(editor.selection.getRng().startContainer.data, 'a');
        LegacyUnit.equal(editor.selection.getRng().startOffset, 1);
      });
  */
  suite.test('ForwardDelete all contents', function (editor) {
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.fire('keydown', { keyCode: 46 });
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><br data-mce-bogus="1"></p>');
    LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'P');
  });

  suite.test('Delete all contents', function (editor) {
    editor.getBody().innerHTML = '<p>abc</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 3);
    editor.fire('keydown', { keyCode: 8 });
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p><br data-mce-bogus="1"></p>');
    LegacyUnit.equal(editor.selection.getStart(true).nodeName, 'P');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const steps = Env.webkit ? suite.toSteps(editor) : [];
    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    disable_nodechange: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
