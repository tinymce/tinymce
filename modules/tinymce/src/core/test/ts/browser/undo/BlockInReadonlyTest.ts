import { Keys } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
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

    // TODO: interesting, check wht this brakes even
    it('TINY-12992: should block adding undo level when content changes with enter key', () => {
      const editor = hook.editor();
      editor.resetContent('<h1>Initial content</h1>');
      assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo level initially');

      editor.setContent('<h2>Changed content</h2>');
      TinySelections.setCursor(editor, [0, 0], 'Changed content'.length);
      TinyContentActions.keydown(editor, Keys.enter());

      assert.isFalse(editor.undoManager.hasUndo(), 'Should not add undo level in readonly mode');
    });
  });

  describe('Readonly editor with initial content', () => {
    const initialContent = '<h1>Initial content</h1>';

    const setupElement = () => {
      const container = SugarElement.fromTag('div');
      const editorElm = SugarElement.fromTag('textarea');
      editorElm.dom.innerHTML = '<h1>Initial content</h1>';
      Insert.append(container, editorElm);
      Insert.append(SugarBody.body(), container);
      return {
        element: editorElm,
        teardown: () => Remove.remove(container)
      };
    };

    const hook = TinyHooks.bddSetupFromElement<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      readonly: true
    }, setupElement, []);

    // TODO: this is on a technical level, I think I should go and check the behavior of actual undo/redo
    it('TINY-12992: should have initial state in history on init in readonly mode', () => {
      const editor = hook.editor();

      assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo initially');
      assert.equal(editor.undoManager.data.length, 1, 'Should have only one undo level initially');
      const firstLevel = editor.undoManager.data[0];
      assert.equal(firstLevel.content, initialContent);
    });
  });

  // TODO:
  describe.only('Mode toggling', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    it('TINY-12992: TODO', () => {
      const editor = hook.editor();
      editor.resetContent('<p></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      TinyContentActions.type(editor, 'First line');
      TinyContentActions.keydown(editor, Keys.enter());

      // TODO: start from here, analyse what is the undo state, make sure that state changes will not invoke another undo level
      assert.equal(true, false);
    });

    // TODO: here I think we should also test interop with toggling the state on/off and looking at the undo history
    // 1. Initialize editor
    // 2. Enter design mode
    // 3. Add content
    // 4. Undo
    // 5. Now again there's an empty page
    // 6. Enter readonly mode
    // 7. Change content
    // 8. Undo level should not be created and only one element in data
  });
});
