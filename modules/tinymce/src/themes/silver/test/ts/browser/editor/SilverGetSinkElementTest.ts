import { context, describe, it } from '@ephox/bedrock-client';
import { Class, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverGetSinkElementTest', () => {
  context('editor with ui_mode combined', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>({ base_url: '/project/tinymce/js/tinymce' }, () => {
      const editorContainer = SugarElement.fromTag('div');
      Class.add(editorContainer, 'editor-container');
      const editorTextarea = SugarElement.fromTag('textarea');
      Insert.append(editorContainer, editorTextarea);
      Insert.append(SugarBody.body(), editorContainer);

      return {
        element: editorTextarea,
        teardown: () => {
          Remove.remove(editorContainer);
        },
      };
    }, []);

    it('TINY-13503: getSinkElement(\'dialog\') should return correct dialog sink', () => {
      const editor = hook.editor();
      const sink = editor.theme.getSinkElement?.('dialog') ?? null;

      assert.isNotNull(sink);
      assert.isTrue(sink.classList.contains('tox-silver-sink'));
      assert.equal(sink.parentElement, SugarBody.body().dom, 'Sink should be a child of body');
    });

    it('TINY-13503: getSinkElement(\'popup\') should return correct popup sink', () => {
      const editor = hook.editor();
      const sink = editor.theme.getSinkElement?.('popup') ?? null;

      assert.isNotNull(sink);
      assert.isTrue(sink.classList.contains('tox-silver-sink'));
      assert.equal(sink.parentElement, SugarBody.body().dom, 'Sink should be a child of body');
    });

    it('TINY-13503: dialog sink and popoup sink should be the same element', () => {
      const editor = hook.editor();
      const dialogSink = editor.theme.getSinkElement?.('dialog') ?? null;
      const popupSink = editor.theme.getSinkElement?.('popup') ?? null;

      assert.isNotNull(dialogSink);
      assert.isNotNull(popupSink);
      assert.equal(dialogSink, popupSink, 'Dialog sink and popup sink should be the same element');
    });
  });

  context('editor with ui_mode split', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>({ base_url: '/project/tinymce/js/tinymce', ui_mode: 'split' }, () => {
      const editorContainer = SugarElement.fromTag('div');
      Class.add(editorContainer, 'editor-container');
      const editorTextarea = SugarElement.fromTag('textarea');
      Insert.append(editorContainer, editorTextarea);
      Insert.append(SugarBody.body(), editorContainer);

      return {
        element: editorTextarea,
        teardown: () => {
          Remove.remove(editorContainer);
        },
      };
    }, [], true);

    it('TINY-13503: getSinkElement(\'dialog\') should return correct dialog sink', () => {
      const editor = hook.editor();
      const sink = editor.theme.getSinkElement?.('dialog') ?? null;

      assert.isNotNull(sink);
      assert.isTrue(sink.classList.contains('tox-silver-sink'));
      assert.equal(sink.parentElement, SugarBody.body().dom, 'Sink should be a child of body');
    });

    it('TINY-13503: getSinkElement(\'popup\') should return correct popup sink', () => {
      const editor = hook.editor();
      const sink = editor.theme.getSinkElement?.('popup') ?? null;

      assert.isNotNull(sink);
      assert.isTrue(sink.classList.contains('tox-silver-sink'));
      assert.isTrue(sink.classList.contains('tox-silver-popup-sink'));
      assert.equal(sink.previousSibling, editor.getContainer(), 'Sink should be a sibling of the editor container');
    });

    it('TINY-13503: dialog sink and popoup sink should be two different elements', () => {
      const editor = hook.editor();
      const dialogSink = editor.theme.getSinkElement?.('dialog') ?? null;
      const popupSink = editor.theme.getSinkElement?.('popup') ?? null;

      assert.isNotNull(dialogSink);
      assert.isNotNull(popupSink);
      assert.notEqual(dialogSink, popupSink, 'Dialog sink and popup sink should be two different elements');
    });
  });
});
