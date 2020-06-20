import { Assertions, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Range } from '@ephox/dom-globals';
import { LegacyUnit, TinyDom, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Theme from 'tinymce/themes/silver/Theme';
import * as HtmlUtils from '../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.core.MiscCommandsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  const normalizeRng = function (rng: Range) {
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

  const ok = function (value: boolean, label?: string) {
    return Assert.eq(label, true, value);
  };

  suite.test('InsertHorizontalRule', function (editor) {
    let rng;

    editor.setContent('<p>123</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('InsertHorizontalRule');
    Assert.eq('', '<p>1</p><hr /><p>3</p>', editor.getContent());
    rng = normalizeRng(editor.selection.getRng());
    ok(rng.collapsed);
    Assertions.assertDomEq('Nodes are not equal', TinyDom.fromDom(editor.getBody().lastChild), TinyDom.fromDom(rng.startContainer));
    Assert.eq('', 'P', rng.startContainer.nodeName);
    Assert.eq('', 0, rng.startOffset);
    Assert.eq('', 'P', rng.endContainer.nodeName);
    Assert.eq('', 0, rng.endOffset);
  });

  if (Env.ceFalse) {
    suite.test('SelectAll', function (editor) {
      editor.setContent('<p>a</p><div contenteditable="false"><div contenteditable="true">b</div><p>c</p>');
      LegacyUnit.setSelection(editor, 'div div', 0);
      editor.execCommand('SelectAll');
      Assert.eq('', 'DIV', editor.selection.getStart().nodeName);
      Assert.eq('', 'DIV', editor.selection.getEnd().nodeName);
      Assert.eq('', false, editor.selection.isCollapsed());
    });
  }

  suite.test('InsertLineBreak', function (editor) {
    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 2);
    editor.execCommand('InsertLineBreak');
    Assert.eq('', '<p>12<br />3</p>', editor.getContent());

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertLineBreak');
    Assert.eq('', '<p><br />123</p>', editor.getContent());

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    editor.execCommand('InsertLineBreak');
    Assert.eq('', '<p>123<br><br></p>', HtmlUtils.cleanHtml(editor.getBody().innerHTML));
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
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
