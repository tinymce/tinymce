import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Theme ]);

  const pressEnter = (editor: Editor, evt?: any) => {
    const dom = editor.dom;
    const target = editor.selection.getNode();

    evt = Tools.extend({ keyCode: 13 }, evt);

    dom.fire(target, 'keydown', evt);
    dom.fire(target, 'keypress', evt);
    dom.fire(target, 'keyup', evt);
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
});
