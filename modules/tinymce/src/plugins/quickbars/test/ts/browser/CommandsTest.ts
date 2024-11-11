import { TestStore } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
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

  const testQuickbarInsertImage = (editor: Editor, expectedPreAddCommand: string[], expectedPostAddCommand: string[]) => {
    store.clear();
    store.assertEq('it should be empty at start', []);
    editor.execCommand('QuickbarInsertImage');
    store.assertEq('should use predefined command if it exists', expectedPreAddCommand);

    editor.addCommand('QuickbarInsertImage', () => store.add('QII-setted-after'));
    editor.execCommand('QuickbarInsertImage');

    store.assertEq('it should exec the overwritten command', expectedPostAddCommand);
  };

  context('QuickbarInsertImage predefined command', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'quickbars',
      inline: true,
      toolbar: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ QuickbarsPlugin ], true);

    it('TINY-11399: it should be possible to overwrite QuickbarInsertImage', async () => {
      const editor = hook.editor();
      testQuickbarInsertImage(editor, [], [ 'QII-setted-after' ]);
    });
  });

  context('QuickbarInsertImage command', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'fake quickbars',
      inline: true,
      toolbar: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ FakePlugin, QuickbarsPlugin ], true);

    it('TINY-11399: QuickbarInsertImage should be overwritten by the other plugins', async () => {
      const editor = hook.editor();
      testQuickbarInsertImage(editor, [ 'QII' ], [ 'QII', 'QII-setted-after' ]);
    });
  });
});
