import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.CloudOptionsTest', () => {
  context('No option defined in init', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, [ ]);

    it('onboarding option', () => {
      const editor = hook.editor();

      assert.isTrue(editor.options.get('onboarding'), 'Should be enabled by default');

      editor.options.set('onboarding', false);
      assert.isFalse(editor.options.get('onboarding'), 'Should not be enabled is set to false');

      editor.options.unset('onboarding');
      assert.isTrue(editor.options.get('onboarding'), 'Should be back to initial value');
    });

    it('tiny_cloud_entry_url option', () => {
      const editor = hook.editor();

      assert.isUndefined(editor.options.get('tiny_cloud_entry_url'), 'Should not be defined by default');

      editor.options.set('tiny_cloud_entry_url', 'custom-url');
      assert.equal(editor.options.get('tiny_cloud_entry_url'), 'custom-url', 'Should be updated to custom url');

      editor.options.unset('tiny_cloud_entry_url');
      assert.isUndefined(editor.options.get('tiny_cloud_entry_url'), 'Should be back to initial value');
    });
  });

  context('Option defined in init', () => {
    let onboardingOption: boolean | undefined;
    let tinyCloudEntryUrlOption: string;

    const addEditorEventHandler = ({ editor }: EditorEvent<{ editor: Editor }>) => {
      onboardingOption = editor.options.get('onboarding');
      tinyCloudEntryUrlOption = editor.options.get('tiny_cloud_entry_url');
    };

    before(() => {
      EditorManager.on('AddEditor', addEditorEventHandler);
    });

    after(() => {
      EditorManager.off('AddEditor', addEditorEventHandler);
    });

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      onboarding: false,
      tiny_cloud_entry_url: 'custom-url',
    }, [ ]);

    it('editor options in init and `AddEditor` event', () => {
      const editor = hook.editor();

      assert.isFalse(onboardingOption, 'Should be set to false');
      assert.isFalse(editor.options.get('onboarding'), 'Should be set to false');

      assert.equal(tinyCloudEntryUrlOption, 'custom-url', 'Should be set to custom url');
      assert.equal(editor.options.get('tiny_cloud_entry_url'), 'custom-url', 'Should be set to custom url');
    });
  });
});

