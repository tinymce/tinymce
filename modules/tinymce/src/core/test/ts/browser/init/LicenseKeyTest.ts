
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare const tinymce: TinyMCE;

describe('browser.tinymce.core.init.LicenseKeyTest', () => {
  let oldWarn: typeof console.warn;
  let messages: string[] = [];

  const beforeHandler = () => {
    messages = [];
    oldWarn = Global.console.warn;
    Global.console.warn = (...args: any[]) => {
      messages.push(Arr.map(args, (arg) => String(arg)).join(' '));
    };
  };

  const afterHandler = () => {
    Global.console.warn = oldWarn;
  };

  before(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tinymce._addLicenseKeyManager(() => {
      return {
        verify: () => Promise.resolve(false),
        validate: () => Promise.resolve(false)
      };
    });
  });

  context('No license key specified', () => {
    before(() => {
      beforeHandler();
    });
    after(afterHandler);

    const hook = TinyHooks.bddSetupLight<Editor>({
      license_key: undefined,
      base_url: '/project/tinymce/js/tinymce'
    });

    it('Should not have any console messages since gpl was provided', () => {
      assert.deepEqual(messages, []);
    });

    it('TINY-12058: editor.licenseKeyManager should be defined', () => {
      const editor = hook.editor();
      assert.isObject(editor.licenseKeyManager);
      assert.isFunction(editor.licenseKeyManager.verify);
      assert.isFunction(editor.licenseKeyManager.validate);
    });

    it('TINY-12058: verify should return false', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.verify?.(editor);
      assert.isFalse(result);
    });

    it('TINY-12058: validate should return true by default', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate?.(editor);
      assert.isFalse(result);
    });
  });

  context('GPL license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl'
    });

    it('Should not have any console messages since gpl was provided', () => {
      assert.deepEqual(messages, []);
    });

    it('TINY-12058: editor.licenseKeyManager should be defined', () => {
      const editor = hook.editor();
      assert.isObject(editor.licenseKeyManager);
      assert.isFunction(editor.licenseKeyManager.verify);
      assert.isFunction(editor.licenseKeyManager.validate);
    });

    it('TINY-12058: verify should return true', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.verify?.(editor);
      assert.isTrue(result);
    });

    it('TINY-12058: validate should return true by default', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate?.(editor);
      assert.isTrue(result);
    });

    it('TINY-12058: validate should return false when given any plugin', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate?.(editor, { plugin: 'foo' });
      assert.isFalse(result);
    });
  });

  context('Non-GPL license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'foo'
    }, []);

    it('Should not have any console messages since gpl was provided', () => {
      assert.deepEqual(messages, []);
    });

    it('TINY-12058: editor.licenseKeyManager should be defined', () => {
      const editor = hook.editor();
      assert.isObject(editor.licenseKeyManager);
      assert.isFunction(editor.licenseKeyManager.verify);
      assert.isFunction(editor.licenseKeyManager.validate);
    });

    it('TINY-12058: verify should return false', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.verify?.(editor);
      assert.isFalse(result);
    });

    it('TINY-12058: validate should return true by default', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate?.(editor);
      assert.isFalse(result);
    });
  });
});
