import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { GetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { getContent, GetSelectionContentArgs } from 'tinymce/core/selection/GetSelectionContent';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.selection.GetSelectionContentTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);
  const testDivId = 'testDiv1';

  const focusDiv = () => {
    const input = document.querySelector<HTMLDivElement>('#' + testDivId);
    input.focus();
  };

  const removeTestDiv = () => {
    const input = document.querySelector('#' + testDivId);
    input.parentNode.removeChild(input);
  };

  const addTestDiv = () => {
    const div = document.createElement('div');
    div.innerHTML = 'xxx';
    div.contentEditable = 'true';
    div.id = testDivId;
    document.body.appendChild(div);
  };

  const getSelectionContent = (editor: Editor, args: GetSelectionContentArgs) =>
    getContent(editor, args).toString().replace(/[\r]+/g, '');

  const assertGetContent = (label: string, editor: Editor, expectedContent: string, args: GetSelectionContentArgs = {}) => {
    const content = getSelectionContent(editor, args);
    assert.equal(content, expectedContent, label + ': Should be expected contents');
  };

  const assertGetContentOverrideBeforeGetContent = (label: string, editor: Editor, expectedContent: string, args: GetSelectionContentArgs = {}) => {
    const handler = (e: EditorEvent<GetContentEvent>) => {
      if (e.selection === true) {
        e.preventDefault();
        e.content = expectedContent;
      }
    };

    editor.on('BeforeGetContent', handler);
    const content = getSelectionContent(editor, args);
    assert.equal(content, expectedContent, label + ': Should be expected contents');
    editor.off('BeforeGetContent', handler);
  };

  it('TBA: Should be empty contents on a caret selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
    assertGetContent('Should be empty selection on caret', editor, '');
  });

  it('TBA: Should be text contents on a range selection', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    assertGetContent('Should be some content', editor, 'a');
  });

  it('TBA: Should be text contents provided by override handler', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    assertGetContentOverrideBeforeGetContent('Should be overridden content', editor, 'X');
  });

  it(`TBA: Should be text contents when editor isn't focused and format is text`, () => {
    const editor = hook.editor();
    addTestDiv();
    editor.setContent('<p>ab</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    focusDiv();
    assertGetContent('Should be some content', editor, 'ab', { format: 'text' });
    removeTestDiv();
  });

  it('TBA: Should be text content with newline', () => {
    const editor = hook.editor();
    editor.setContent('<p>ab<br/>cd</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 2);
    assertGetContent('Should be some content', editor, 'ab\ncd', { format: 'text' });
  });

  it('TBA: Should be text content with leading visible spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>content<em> Leading space</em></p>');
    TinySelections.setSelection(editor, [ 0 ], 1, [ 0 ], 2);
    assertGetContent('Should be some content', editor, ' Leading space', { format: 'text' });
  });

  it('TBA: Should be text content with trailing visible spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>Trailing space </em>content</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    assertGetContent('Should be some content', editor, 'Trailing space ', { format: 'text' });
  });

  it('TINY-6448: pre blocks should have preserved spaces', () => {
    const editor = hook.editor();
    editor.setContent('<pre>          This      Has\n     Spaces</pre>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    assertGetContent('Should be some content', editor, '          This      Has\n     Spaces', { format: 'text' });
  });

  it('TINY-6448: p blocks should not preserve spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p>          This      Has\n     Spaces</p>');
    TinySelections.setSelection(editor, [ ], 0, [ ], 1);
    assertGetContent('Should be some content', editor, 'This Has Spaces', { format: 'text' });
  });

  it('TBA: Should be text content without non-visible leading/trailing spaces', () => {
    const editor = hook.editor();
    editor.setContent('<p><em> spaces </em></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    // Firefox, IE & Edge actually renders the trailing space within the editor in this case
    // however Firefox reports via innerText that it doesn't render the trailing space. So
    // as discussed we should use whatever it is returning for innerText
    const expectedContent = browser.isIE() || browser.isEdge() ? 'spaces ' : 'spaces';
    assertGetContent('Should be some content', editor, expectedContent, { format: 'text' });
    editor.setContent('<p> spaces </p>');
    TinySelections.setSelection(editor, [], 0, [], 1);
    assertGetContent('Should be some content', editor, 'spaces', { format: 'text' });
  });
});
