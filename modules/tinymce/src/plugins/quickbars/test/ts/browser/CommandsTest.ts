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
          ed.addCommand('PickFile', () => store.push('PickFile'));
        }
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ QuickbarsPlugin ], true);

    it('TINY-11399: PickFile should be not overwrite by the plugin if it already exists', async () => {
      const editor = hook.editor();
      assert.deepEqual(store, []);
      editor.execCommand('PickFile');
      assert.deepEqual(store, withPresetedCommand ? [ 'PickFile' ] : []);

      editor.addCommand('PickFile', () => store.push('PickFile setted after'));
      editor.execCommand('PickFile');
      assert.deepEqual(store, withPresetedCommand ? [ 'PickFile', 'PickFile setted after' ] : [ 'PickFile setted after' ]);
    });
  });
});
