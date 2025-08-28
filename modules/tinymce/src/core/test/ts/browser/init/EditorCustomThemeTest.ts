import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Theme } from 'tinymce/core/api/ThemeManager';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare const tinymce: TinyMCE;

describe('browser.tinymce.core.init.EditorCustomThemeTest', () => {

  context('function custom theme', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      add_unload_trigger: false,
      disable_nodechange: true,
      automatic_uploads: false,
      entities: 'raw',
      indent: false,
      base_url: '/project/tinymce/js/tinymce',
      theme: (editor: Editor, targetnode: HTMLElement) => {
        const editorContainer = document.createElement('div');
        editorContainer.id = 'editorContainer';

        const iframeContainer = document.createElement('div');
        iframeContainer.id = 'iframeContainer';

        editorContainer.appendChild(iframeContainer);
        targetnode.parentNode?.insertBefore(editorContainer, targetnode);

        if (editor.initialized) {
          editor.dispatch('SkinLoaded');
        } else {
          editor.on('init', () => {
            editor.dispatch('SkinLoaded');
          });
        }

        return {
          iframeContainer,
          editorContainer
        };
      }
    }, []);

    it('getContainer/getContentAreaContainer', () => {
      const editor = hook.editor();
      assert.equal(editor.getContainer().id, 'editorContainer', 'Should be the new editorContainer element');
      assert.equal(editor.getContainer().nodeType, 1, 'Should be an element');
      assert.equal(editor.getContentAreaContainer().id, 'iframeContainer', 'Should be the new iframeContainer element');
      assert.equal(editor.getContentAreaContainer().nodeType, 1, 'Should be an element');
    });
  });

  context('named synchronous custom theme', () => {

    const SyncTheme = () => {
      tinymce.ThemeManager.add('sync_theme', (editor): Theme => {
        const theme: Theme = {
          renderUI: () => {
            const editorContainer = document.createElement('div');
            editor.getElement().after(editorContainer);
            editor.dispatch('SkinLoaded');
            return {
              editorContainer
            };
          }
        };
        return theme;
      });
    };

    const eventsOrdered: string[] = [];

    const hook = TinyHooks.bddSetup<Editor>({
      indent: false,
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      theme: 'sync_theme',
      setup: (editor: Editor) => {
        editor.on('init', () => {
          eventsOrdered.push('init');
        });
        editor.on('SkinLoaded', () => {
          eventsOrdered.push('SkinLoaded');
        });
      }
    }, [ SyncTheme ]);

    it('The skin loads before editor finshes initializing', () => {
      hook.editor();
      assert.deepEqual(eventsOrdered, [ 'SkinLoaded', 'init' ]);
    });
  });

  context('named asynchronous custom theme', () => {

    const AsyncTheme = () => {
      tinymce.ThemeManager.add('sync_theme', (editor): Theme => {
        const theme: Theme = {
          renderUI: async () => {
            const editorContainer = document.createElement('div');
            editor.getElement().after(editorContainer);
            const promise = new Promise((resolve, _reject) => {
              setTimeout(() => resolve(editor.dispatch('SkinLoaded')), 10);
            });
            await promise;

            return {
              editorContainer
            };
          }
        };
        return theme;
      });
    };

    const eventsOrdered: string[] = [];

    const hook = TinyHooks.bddSetup<Editor>({
      indent: false,
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      theme: 'sync_theme',
      setup: (editor: Editor) => {
        editor.on('init', () => {
          eventsOrdered.push('init');
        });
        editor.on('SkinLoaded', () => {
          eventsOrdered.push('SkinLoaded');
        });
      }
    }, [ AsyncTheme ]);

    it('The skin loads before editor finishes initializing', () => {
      hook.editor();
      assert.deepEqual(eventsOrdered, [ 'SkinLoaded', 'init' ]);
    });
  });
});

