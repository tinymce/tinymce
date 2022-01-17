import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ApplyDlTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Apply DL list to multiple Ps', () => {
    const editor = hook.editor();

    editor.setContent(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );
    editor.focus();

    LegacyUnit.setSelection(editor, 'p', 0, 'p:last-of-type', 0);
    editor.execCommand('InsertDefinitionList');

    TinyAssertions.assertContent(
      editor,
      '<dl>' +
      '<dt>a</dt>' +
      '<dt>b</dt>' +
      '<dt>c</dt>' +
      '</dl>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'DT');
  });

  it('TBA: Apply OL list to single P', () => {
    const editor = hook.editor();

    editor.setContent('<p>a</p>');
    editor.focus();

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertDefinitionList');

    TinyAssertions.assertContent(editor, '<dl><dt>a</dt></dl>');
    assert.equal(editor.selection.getNode().nodeName, 'DT');
  });

  it('TBA: Apply DL to P and merge with adjacent lists', () => {
    const editor = hook.editor();

    editor.setContent(
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>' +
      '<p>b</p>' +
      '<dl>' +
      '<dt>c</dt>' +
      '</dl>'
    );
    editor.focus();

    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('InsertDefinitionList');

    TinyAssertions.assertContent(
      editor,
      '<dl>' +
      '<dt>a</dt>' +
      '<dt>b</dt>' +
      '<dt>c</dt>' +
      '</dl>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'DT');
  });

  it('TBA: Indent single DT in DL', () => {
    const editor = hook.editor();

    editor.setContent(
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>'
    );
    editor.focus();

    LegacyUnit.setSelection(editor, 'dt', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(
      editor,
      '<dl>' +
      '<dd>a</dd>' +
      '</dl>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'DD');
  });

  it('TBA: Outdent single DD in DL', () => {
    const editor = hook.editor();

    editor.setContent(
      '<dl>' +
      '<dd>a</dd>' +
      '</dl>'
    );
    editor.focus();

    LegacyUnit.setSelection(editor, 'dd', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(
      editor,
      '<dl>' +
      '<dt>a</dt>' +
      '</dl>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'DT');
  });
});
