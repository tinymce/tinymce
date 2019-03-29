import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import HtmlUtils from '../module/test/HtmlUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.MiscCommandsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const normalizeRng = function (rng) {
    if (rng.startContainer.nodeType === 3) {
      if (rng.startOffset === 0) {
        rng.setStartBefore(rng.startContainer);
      } else if (rng.startOffset >= rng.startContainer.nodeValue.length - 1) {
        rng.setStartAfter(rng.startContainer);
      }
    }

    if (rng.endContainer.nodeType === 3) {
      if (rng.endOffset === 0) {
        rng.setEndBefore(rng.endContainer);
      } else if (rng.endOffset >= rng.endContainer.nodeValue.length - 1) {
        rng.setEndAfter(rng.endContainer);
      }
    }

    return rng;
  };

  const ok = function (value, label?) {
    return LegacyUnit.equal(value, true, label);
  };

  suite.test('InsertHorizontalRule', function (editor) {
    let rng;

    editor.setContent('<p>123</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('InsertHorizontalRule');
    LegacyUnit.equal(editor.getContent(), '<p>1</p><hr /><p>3</p>');
    rng = normalizeRng(editor.selection.getRng(true));
    ok(rng.collapsed);
    LegacyUnit.equalDom(rng.startContainer, editor.getBody().lastChild);
    LegacyUnit.equal(rng.startContainer.nodeName, 'P');
    LegacyUnit.equal(rng.startOffset, 0);
    LegacyUnit.equal(rng.endContainer.nodeName, 'P');
    LegacyUnit.equal(rng.endOffset, 0);
  });

  if (Env.ceFalse) {
    suite.test('SelectAll', function (editor) {
      editor.setContent('<p>a</p><div contenteditable="false"><div contenteditable="true">b</div><p>c</p>');
      LegacyUnit.setSelection(editor, 'div div', 0);
      editor.execCommand('SelectAll');
      LegacyUnit.equal(editor.selection.getStart().nodeName, 'DIV');
      LegacyUnit.equal(editor.selection.getEnd().nodeName, 'DIV');
      LegacyUnit.equal(editor.selection.isCollapsed(), false);
    });
  }

  suite.test('InsertLineBreak', function (editor) {
    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 2);
    editor.execCommand('InsertLineBreak');
    LegacyUnit.equal(editor.getContent(), '<p>12<br />3</p>');

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertLineBreak');
    LegacyUnit.equal(editor.getContent(), '<p><br />123</p>');

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    editor.execCommand('InsertLineBreak');
    LegacyUnit.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), (Env.ie && Env.ie < 11) ? '<p>123<br></p>' : '<p>123<br><br></p>');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    convert_urls: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,' +
        'float,margin,margin-top,margin-right,margin-bottom,margin-left,padding-left,text-align,display'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
