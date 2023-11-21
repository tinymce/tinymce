import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorResetContentTest', () => {
  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const hook = TinyHooks.bddSetupLight<Editor>(baseSettings, []);

  const assertEditorState = (editor: Editor, content: string) => {
    const html = editor.getContent();
    Assertions.assertHtml('Editor content should be expected html', content, html);
    assert.isFalse(editor.isDirty(), 'Editor should not be dirty');
    assert.isFalse(editor.undoManager.hasUndo(), 'UndoManager should not have any undo levels');
    assert.isFalse(editor.undoManager.hasRedo(), 'UndoManager should not have any redo levels');
    assert.equal(editor.startContent, '<p><br data-mce-bogus="1"></p>', 'Editor start content should match the original content');
  };

  it('Reset editor content/state with initial content', () => {
    const editor = hook.editor();
    editor.setContent('<p>some</p><p>content</p>');
    editor.resetContent();
    assertEditorState(editor, '');
  });

  it('Reset editor content/state with custom content', () => {
    const editor = hook.editor();
    editor.setContent('<p>some</p><p>content</p>');
    editor.resetContent('<p>html</p>');
    assertEditorState(editor, '<p>html</p>');
  });

  it('Reset editor content/state with multiple undo levels', () => {
    const editor = hook.editor();
    editor.setContent('<p>some</p><p>content</p>');
    editor.undoManager.add();
    editor.setContent('<p>some</p><p>other</p><p>content</p>');
    editor.undoManager.add();
    editor.nodeChanged();
    assert.isTrue(editor.isDirty(), 'Editor should be dirty');
    assert.isTrue(editor.undoManager.hasUndo(), 'UndoManager should have some undo levels');
    editor.resetContent('<p>html</p>');
    assertEditorState(editor, '<p>html</p>');
  });

  context('Content XSS', () => {
    const xssFnName = 'xssfn';

    const testResetContentMxss = (content: string) => async () => {
      const editor = await McEditor.pFromHtml<Editor>(`<textarea>${content}</textarea>`, {
        ...baseSettings,
        valid_elements: '*'
      });
      let hasXssOccurred = false;
      (editor.getWin() as any)[xssFnName] = () => hasXssOccurred = true;
      editor.resetContent();
      assert.isFalse(hasXssOccurred, 'XSS should not have occurred');
      (editor.getWin() as any)[xssFnName] = null;
    };

    it('TINY-10236: Excluding data-mce-bogus="all" elements does not cause mXSS',
      testResetContentMxss(`<!--<br data-mce-bogus="all">><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding temporary attributes does not cause mXSS',
      testResetContentMxss(`<!--data-mce-selected="x"><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding ZWNBSP in comment nodes does not cause mXSS',
      testResetContentMxss(`<!--\uFEFF><iframe onload="window.${xssFnName}();">->`));

    Arr.each([ 'noscript', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
      it(`TINY-10305: Excluding ZWNBSP in ${parent} does not cause mXSS`,
        testResetContentMxss(`<${parent}><\uFEFF/${parent}><\uFEFFiframe onload="window.${xssFnName}();"></${parent}>`));
    });
  });

  context('ZWNBSP', () => {
    it('TINY-10305: Should remove ZWNBSP from initial content in target element', async () => {
      const editor = await McEditor.pFromHtml<Editor>('<textarea><p>te\uFEFFst</p></textarea>', baseSettings);
      editor.setContent('<p>some</p><p>content</p>');
      editor.resetContent();
      TinyAssertions.assertRawContent(editor, '<p>test</p>');
    });

    it('TINY-10305: Should remove ZWNBSP from initial content as parameter', () => {
      const editor = hook.editor();
      editor.setContent('<p>some</p><p>content</p>');
      editor.resetContent('<p>te\uFEFFst</p>');
      TinyAssertions.assertRawContent(editor, '<p>test</p>');
    });
  });
});
