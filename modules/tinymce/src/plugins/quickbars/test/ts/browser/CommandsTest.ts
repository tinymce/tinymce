import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.plugins.quickbars.CommandsTest', () => {
  Arr.each([ true, false ], (withPresetedCommand) => {
    const store: string[] = [];
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'quickbars',
      inline: true,
      toolbar: false,
      menubar: false,
      setup: (ed: Editor) => {
        if (withPresetedCommand) {
          ed.addCommand('QuickbarInsertImage', () => store.push('QII'));
        }
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ QuickbarsPlugin ], true);

    it('TINY-11399: QuickbarInsertImage should be not overwrite by the plugin if it already exists', async () => {
      const editor = hook.editor();
      assert.deepEqual(store, []);
      editor.execCommand('QuickbarInsertImage');
      assert.deepEqual(store, withPresetedCommand ? [ 'QII' ] : []);

      editor.addCommand('QuickbarInsertImage', () => store.push('QII setted after'));
      editor.execCommand('QuickbarInsertImage');
      assert.deepEqual(store, withPresetedCommand ? [ 'QII', 'QII setted after' ] : [ 'QII setted after' ]);
    });
  });
});
