import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

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
  }, []);

  const isTextNode = (node: Node): node is Text =>
    node.nodeType === 3;

  const normalizeRng = (rng: Range) => {
    if (isTextNode(rng.startContainer)) {
      if (rng.startOffset === 0) {
        rng.setStartBefore(rng.startContainer);
      } else if (rng.startOffset >= rng.startContainer.data.length - 1) {
        rng.setStartAfter(rng.startContainer);
      }
    }

    if (isTextNode(rng.endContainer)) {
      if (rng.endOffset === 0) {
        rng.setEndBefore(rng.endContainer);
      } else if (rng.endOffset >= rng.endContainer.data.length - 1) {
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
    rng.setStart(editor.dom.select('p')[0].firstChild as Text, 1);
    rng.setEnd(editor.dom.select('p')[0].firstChild as Text, 2);
    editor.selection.setRng(rng);
    editor.execCommand('InsertHorizontalRule');
    TinyAssertions.assertContent(editor, '<p>1</p><hr><p>3</p>');
    rng = normalizeRng(editor.selection.getRng());
    assert.isTrue(rng.collapsed);
    Assertions.assertDomEq('Nodes are not equal', SugarElement.fromDom(editor.getBody().lastChild as HTMLParagraphElement), SugarElement.fromDom(rng.startContainer));
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
});
