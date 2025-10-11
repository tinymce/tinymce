import { Keys } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.BlockInReadonlyTest', () => {
  describe('Readonly editor', () => {
    let inputElm: HTMLElement;
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      readonly: true
    }, []);

    before(() => {
      const editor = hook.editor();
      inputElm = DOMUtils.DOM.create('input', {});
      editor.getContainer().parentNode?.appendChild(inputElm);
    });

    after(() => {
      DOMUtils.DOM.remove(inputElm);
    });

    it('TINY-12992: should block adding undo level when content changes via transact in readonly mode', () => {
      const editor = hook.editor();
      editor.resetContent('<h1>Initial content</h1>');
      assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo level initially');

      editor.undoManager.transact(() => {
        editor.setContent('<h2>Changed content</h2>');
      });
      assert.isFalse(editor.undoManager.hasUndo(), 'Should not add undo level in readonly mode');
    });

    it('TINY-12992: should block adding undo level when content changes with blur', () => {
      const editor = hook.editor();
      editor.resetContent('<h1>Initial content</h1>');
      assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo level initially');

      editor.focus();
      editor.setContent('<h2>Changed content</h2>');
      inputElm.focus();

      assert.isFalse(editor.undoManager.hasUndo(), 'Should not add undo level in readonly mode');
    });

    it('TINY-12992: should block adding undo level when content changes with enter key', () => {
      const editor = hook.editor();
      editor.resetContent('<h1>Initial content</h1>');
      assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo level initially');

      editor.setContent('<h2>Changed content</h2>');
      TinySelections.setCursor(editor, [ 0, 0 ], 'Changed content'.length);
      TinyContentActions.keydown(editor, Keys.enter());

      assert.isFalse(editor.undoManager.hasUndo(), 'Should not add undo level in readonly mode');
    });
  });

  describe('Readonly editor with initial content', () => {
    const initialContent = '<h1>Initial content</h1>';

    const setupElement = () => {
      const container = SugarElement.fromTag('div');
      const editorElm = SugarElement.fromTag('textarea');
      editorElm.dom.innerHTML = initialContent;
      Insert.append(container, editorElm);
      Insert.append(SugarBody.body(), container);
      return {
        element: editorElm,
        teardown: () => Remove.remove(container)
      };
    };

    describe('Should have one entry in history', () => {
      const hook = TinyHooks.bddSetupFromElement<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        readonly: true
      }, setupElement, []);

      it('TINY-12992: should have initial state in history on init in readonly mode', () => {
        const editor = hook.editor();

        assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo initially');
        assert.equal(editor.undoManager.data.length, 1, 'Should have only one undo level initially');
        const firstLevel = editor.undoManager.data[0];
        assert.equal(firstLevel.content, initialContent);
      });
    });

    describe('Should be able to go back to the initial state', () => {
      const hook = TinyHooks.bddSetupFromElement<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        readonly: true
      }, setupElement, []);

      it('TINY-12992: should be able to go back to initial state when editor was initialized in readonly mode', () => {
        const editor = hook.editor();

        assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo initially');
        editor.mode.set('design');
        editor.undoManager.transact(() => {
          editor.setContent('<h2>Changed content</h2>');
        });
        assert.isTrue(editor.undoManager.hasUndo(), 'Should have undo');
        editor.undoManager.undo();
        TinyAssertions.assertContent(editor, initialContent);
      });
    });
  });
});
