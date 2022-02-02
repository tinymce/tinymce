import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.core.MiscCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
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
  }, [ Theme ]);

  const normalizeRng = (rng: Range) => {
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

  it('InsertHorizontalRule', () => {
    const editor = hook.editor();
    let rng;

    editor.setContent('<p>123</p>');
    rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 2);
    editor.selection.setRng(rng);
    editor.execCommand('InsertHorizontalRule');
    assert.equal(editor.getContent(), '<p>1</p><hr /><p>3</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    Assertions.assertDomEq('Nodes are not equal', SugarElement.fromDom(editor.getBody().lastChild), SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startContainer.nodeName, 'P');
    assert.equal(rng.startOffset, 0);
    assert.equal(rng.endContainer.nodeName, 'P');
    assert.equal(rng.endOffset, 0);
  });

  it('SelectAll', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><div contenteditable="false"><div contenteditable="true">b</div><p>c</p>');
    LegacyUnit.setSelection(editor, 'div div', 0);
    editor.execCommand('SelectAll');
    assert.equal(editor.selection.getStart().nodeName, 'DIV');
    assert.equal(editor.selection.getEnd().nodeName, 'DIV');
    assert.equal(editor.selection.isCollapsed(), false);
  });

  it('InsertLineBreak', () => {
    const editor = hook.editor();
    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 2);
    editor.execCommand('InsertLineBreak');
    assert.equal(editor.getContent(), '<p>12<br />3</p>');

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertLineBreak');
    assert.equal(editor.getContent(), '<p><br />123</p>');

    editor.setContent('<p>123</p>');
    LegacyUnit.setSelection(editor, 'p', 3);
    editor.execCommand('InsertLineBreak');
    assert.equal(HtmlUtils.cleanHtml(editor.getBody().innerHTML), '<p>123<br><br></p>');
  });
});
