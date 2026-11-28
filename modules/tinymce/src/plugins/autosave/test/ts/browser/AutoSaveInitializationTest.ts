import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import ThemeManager from 'tinymce/core/api/ThemeManager';
import Delay from 'tinymce/core/api/util/Delay';
import Plugin from 'tinymce/plugins/autosave/Plugin';

describe('browser.tinymce.plugins.autosave.AutoSaveInitializationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autosave',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('preserves drafts while another editor is still initializing', async () => {
    // The theme holds initialization after plugin registration and before the editor has a DOM.
    let releaseTheme: () => void = Fun.noop;
    let themeStarted: () => void = Fun.noop;
    const started = new Promise<void>((resolve) => {
      themeStarted = resolve;
    });
    ThemeManager.add('autosave_delayed_test', (editor) => ({
      renderUI: () => new Promise((resolve) => {
        const container = document.createElement('div');
        editor.getElement().after(container);
        releaseTheme = () => resolve({ editorContainer: container, iframeContainer: container });
        themeStarted();
      })
    }));

    const pendingTarget = document.createElement('textarea');
    pendingTarget.id = 'autosave-pending-test';
    document.body.appendChild(pendingTarget);
    const readyTarget = document.createElement('div');
    readyTarget.id = 'autosave-ready-test';
    document.body.appendChild(readyTarget);
    const prefix = 'autosave-init-test-';
    const oldDraftKey = `${prefix}${pendingTarget.id}-draft`;
    const oldTimeKey = `${prefix}${pendingTarget.id}-time`;
    const readyDraftKey = `${prefix}${readyTarget.id}-draft`;
    localStorage.setItem(oldDraftKey, 'previous draft');
    const oldTime = Date.now().toString();
    localStorage.setItem(oldTimeKey, oldTime);
    localStorage.removeItem(readyDraftKey);
    localStorage.removeItem(`${prefix}${readyTarget.id}-time`);

    const intervalErrors: unknown[] = [];
    let intervalTicks = 0;
    const setEditorInterval = Delay.setEditorInterval;
    Delay.setEditorInterval = (editor, callback, time) => setEditorInterval(editor, () => {
      if (editor.id === pendingTarget.id) {
        intervalTicks++;
        try {
          callback();
        } catch (err) {
          intervalErrors.push(err);
        }
      } else {
        callback();
      }
    }, time);

    const pending = EditorManager.init({
      target: pendingTarget,
      plugins: 'autosave',
      theme: 'autosave_delayed_test',
      autosave_prefix: `${prefix}{id}-`,
      autosave_interval: '1s',
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl'
    });
    let ready: Editor | undefined;
    try {
      await started;
      const pendingEditor = EditorManager.get(pendingTarget.id) as Editor;
      assert.isFalse(pendingEditor.initialized);
      assert.isUndefined(pendingEditor.dom);
      const [ readyEditor ] = await EditorManager.init({
        target: readyTarget,
        inline: true,
        theme: false,
        skin: false,
        content_css: false,
        plugins: 'autosave',
        autosave_prefix: `${prefix}{id}-`,
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl'
      });
      ready = readyEditor;
      ready.setContent('<p>new draft</p>');
      ready.setDirty(true);

      let unloadError: unknown;
      try {
        EditorManager.dispatch('BeforeUnload');
      } catch (err) {
        unloadError = err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let directError: unknown;
      try {
        pendingEditor.plugins.autosave.storeDraft();
      } catch (err) {
        directError = err;
      }
      assert.deepEqual({
        intervalRan: intervalTicks > 0,
        intervalErrors: intervalErrors.length,
        unloadFailed: unloadError !== undefined,
        directFailed: directError !== undefined,
        previousDraft: localStorage.getItem(oldDraftKey),
        previousTime: localStorage.getItem(oldTimeKey),
        readyDraft: localStorage.getItem(readyDraftKey)
      }, {
        intervalRan: true,
        intervalErrors: 0,
        unloadFailed: false,
        directFailed: false,
        previousDraft: 'previous draft',
        previousTime: oldTime,
        readyDraft: '<p>new draft</p>'
      });
      assert.isTrue(hook.editor().initialized);
      readyEditor.remove();
      assert.doesNotThrow(() => readyEditor.plugins.autosave.storeDraft(), 'a removed editor must not store a draft');
    } finally {
      Delay.setEditorInterval = setEditorInterval;
      releaseTheme();
      const [ pendingEditor ] = await pending;
      pendingEditor?.remove();
      ready?.remove();
      pendingTarget.remove();
      readyTarget.remove();
      localStorage.removeItem(oldDraftKey);
      localStorage.removeItem(oldTimeKey);
      localStorage.removeItem(readyDraftKey);
      localStorage.removeItem(`${prefix}${readyTarget.id}-time`);
    }
  });
});
