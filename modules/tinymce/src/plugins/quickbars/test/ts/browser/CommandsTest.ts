import { TestStore } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.plugins.quickbars.CommandsTest', () => {
  const store = TestStore();
  const FakePlugin = (): void => {
    PluginManager.add('fake', (editor) => {
      editor.addCommand('QuickbarInsertImage', () => store.add('QII'));
    });
  };
  Arr.each([ true, false ], (withPredefinedCommand) => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: withPredefinedCommand ? 'fake quickbars' : 'quickbars',
      inline: true,
      toolbar: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ FakePlugin, QuickbarsPlugin ], true);

    it(`TINY-11399: QuickbarInsertImage should be not overwritten by the plugin if it already exists${withPredefinedCommand ? ' (withPredefinedCommand)' : ''}`, async () => {
      store.clear();
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
