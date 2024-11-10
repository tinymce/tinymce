import { TestStore } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.plugins.quickbars.CommandsTest', () => {
  Arr.each([ true, false ], (withPredefinedCommand) => {
    const store = TestStore();
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'quickbars',
      inline: true,
      toolbar: false,
      menubar: false,
      setup: (ed: Editor) => {
        if (withPredefinedCommand) {
          ed.addCommand('QuickbarInsertImage', () => store.add('QII'));
        }
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ QuickbarsPlugin ], true);

    it(`TINY-11399: QuickbarInsertImage should be not overwritten by the plugin if it already exists${withPredefinedCommand ? ' (withPresetedCommand)' : ''}`, async () => {
      const editor = hook.editor();
      store.assertEq('it should be empty at start', []);
      editor.execCommand('QuickbarInsertImage');
      store.assertEq('should use predefined command if it exists', withPredefinedCommand ? [ 'QII' ] : []);

      editor.addCommand('QuickbarInsertImage', () => store.add('QII-setted-after'));
      editor.execCommand('QuickbarInsertImage');
      store.assertEq('it should exec the overwritten command', withPredefinedCommand ? [ 'QII', 'QII-setted-after' ] : [ 'QII-setted-after' ]);
    });
  });
});
