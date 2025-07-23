import { Waiter } from '@ephox/agar';
import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';
import 'tinymce';
import Model from 'tinymce/models/dom/Model';
import Theme from 'tinymce/themes/silver/Theme';

import * as ConsoleReader from '../../module/test/ConsoleReader';

declare const tinymce: TinyMCE;

interface EditorState {
  readonly isEditorDisabled: boolean;
  readonly consoleErrorMessages: string[];
  readonly notificationMessages: { text: string; type: 'error' | 'warning' }[];
}

describe('browser.tinymce.core.init.LicenseKeyTest', () => {
  const consoleReader = ConsoleReader.setup();

  before(() => {
    Model();
    Theme();
  });

  beforeEach(() => {
    consoleReader.before();
  });

  afterEach(() => {
    consoleReader.after();
  });

  const pAssertApi = async (editor: Editor, expectedResult: boolean) => {
    assert.isObject(editor.licenseKeyManager);
    assert.isFunction(editor.licenseKeyManager.validate);
    const result = await editor.licenseKeyManager.validate({});
    assert.strictEqual(result, expectedResult, `editor.licenseKeyManager.validate should did not return correct result`);
  };

  const pAssertEditorStatus = async (
    editor: Editor,
    expected: EditorState
  ) => {
    const {
      isEditorDisabled,
      consoleErrorMessages,
      notificationMessages,
    } = expected ?? {};
    await Waiter.pTryUntil(
      `editor disabled should be: ${isEditorDisabled}`,
      () => {
        assert.strictEqual(
          editor.options.get('disabled'),
          isEditorDisabled
        );
      }
    );
    await Waiter.pTryUntil(
      `editor readonly should be: ${isEditorDisabled}`,
      () => {
        assert.strictEqual(
          editor.readonly,
          isEditorDisabled
        );
      }
    );
    // Check UI state
    assert.strictEqual(editor.ui.isEnabled(), !isEditorDisabled);

    assert.deepEqual(
      consoleReader.errorMessages,
      consoleErrorMessages,
      'console error messages'
    );
    const notifications = editor.notificationManager.getNotifications();
    const notificationData = Arr.map(notifications, (n) => ({
      text: n.settings.text,
      type: n.settings.type,
    }));
    assert.deepEqual(notificationData, notificationMessages);
  };

  context('Non-GPL License Key Manager loaded', () => {
    before(() => {
      tinymce._addLicenseKeyManager(() => {
        return {
          validate: () => Promise.resolve(false)
        };
      });
    });

    it('TINY-12001: should use non-gpl license key manager with no license_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: undefined,
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should use non-gpl license key manager with non-GPL license_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'foo',
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should use non-gpl license key manager with GPL license_key set as plugin is loaded', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should use non-gpl license key manager with GPL license_key and api_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
        api_key: 'foo'
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should handle multiple editors correctly', async () => {
      const editor1 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
      });
      await pAssertApi(editor1, false);
      await pAssertEditorStatus(editor1, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });

      const editor2 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'foo',
      });
      await pAssertApi(editor2, false);
      await pAssertEditorStatus(editor2, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });

      const editor3 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: undefined,
      });
      await pAssertApi(editor3, false);
      await pAssertEditorStatus(editor3, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });

      McEditor.remove(editor1);
      McEditor.remove(editor2);
      McEditor.remove(editor3);
    });
  });

  context('Non-GPL License Key Manager not loaded', () => {
    before(() => {
      // Mock license key manager not loaded
      tinymce._addLicenseKeyManager(undefined as any);
    });

    it('TINY-12001: should disable editor with no license_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: undefined,
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: true,
        consoleErrorMessages: [
          `The editor is disabled because a TinyMCE license key has not been provided. ` +
            `Make sure to provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. ` +
            `Read more: https://www.tiny.cloud/docs/tinymce/latest/license-key/`,
        ],
        notificationMessages: [
          {
            type: 'warning',
            text: 'The editor is disabled because a TinyMCE license key has not been provided.',
          },
        ],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should disabled editor with non-GPL license_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'foo',
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: true,
        consoleErrorMessages: [
          `The editor is disabled because the TinyMCE license key could not be validated. ` +
            `The TinyMCE Commercial License Key Manager plugin is required for the provided license key to be validated but could not be loaded. ` +
            `Read more: https://www.tiny.cloud/docs/tinymce/latest/license-key/`,
        ],
        notificationMessages: [
          {
            type: 'warning',
            text: 'The editor is disabled because the TinyMCE license key could not be validated.',
          },
        ],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should use gpl license key manager with GPL license_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
      });
      await pAssertApi(editor, true);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should disable editor with GPL license_key and api_key set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
        api_key: 'foo'
      });
      await pAssertApi(editor, false);
      await pAssertEditorStatus(editor, {
        isEditorDisabled: true,
        consoleErrorMessages: [
          `The editor is disabled because the TinyMCE API key could not be validated. ` +
            `The TinyMCE Commercial License Key Manager plugin is required for the provided API key to be validated but could not be loaded. ` +
            `Read more: https://www.tiny.cloud/docs/tinymce/latest/license-key/`,
        ],
        notificationMessages: [
          {
            type: 'warning',
            text: 'The editor is disabled because the TinyMCE API key could not be validated.',
          },
        ],
      });
      McEditor.remove(editor);
    });

    it('TINY-12001: should handle multiple editors correctly', async () => {
      const editor1 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'gpl',
      });
      await pAssertApi(editor1, true);
      await pAssertEditorStatus(editor1, {
        isEditorDisabled: false,
        consoleErrorMessages: [],
        notificationMessages: [],
      });
      consoleReader.reset();

      const editor2 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'foo',
      });
      await pAssertApi(editor2, false);
      await pAssertEditorStatus(editor2, {
        isEditorDisabled: true,
        consoleErrorMessages: [
          `The editor is disabled because the TinyMCE license key could not be validated. ` +
            `The TinyMCE Commercial License Key Manager plugin is required for the provided license key to be validated but could not be loaded. ` +
            `Read more: https://www.tiny.cloud/docs/tinymce/latest/license-key/`,
        ],
        notificationMessages: [
          {
            type: 'warning',
            text: 'The editor is disabled because the TinyMCE license key could not be validated.',
          },
        ],
      });
      consoleReader.reset();

      const editor3 = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: undefined,
      });
      await pAssertApi(editor3, false);
      await pAssertEditorStatus(editor3, {
        isEditorDisabled: true,
        consoleErrorMessages: [
          `The editor is disabled because a TinyMCE license key has not been provided. ` +
            `Make sure to provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. ` +
            `Read more: https://www.tiny.cloud/docs/tinymce/latest/license-key/`,
        ],
        notificationMessages: [
          {
            type: 'warning',
            text: 'The editor is disabled because a TinyMCE license key has not been provided.',
          },
        ],
      });

      McEditor.remove(editor1);
      McEditor.remove(editor2);
      McEditor.remove(editor3);
    });
  });
});
