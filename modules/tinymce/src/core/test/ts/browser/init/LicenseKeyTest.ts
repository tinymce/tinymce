
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TinyMCE } from 'tinymce/core/api/Tinymce';

declare const tinymce: TinyMCE;

describe('browser.tinymce.core.init.LicenseKeyTest', () => {
  context('Non-GPL License Key Manager', () => {
    before(() => {
      tinymce._addLicenseKeyManager(() => {
        return {
          validate: () => Promise.resolve(false)
        };
      });
    });

    context('No license key specified', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        license_key: undefined,
        base_url: '/project/tinymce/js/tinymce'
      });

      it('TINY-12058: editor.licenseKeyManager should be defined', () => {
        const editor = hook.editor();
        assert.isObject(editor.licenseKeyManager);
        assert.isFunction(editor.licenseKeyManager.validate);
      });

      it('TINY-12058: validate should return false by default', async () => {
        const editor = hook.editor();
        const result = await editor.licenseKeyManager.validate({});
        assert.isFalse(result);
      });
    });

    context('Non-GPL license key specified', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        license_key: 'foo'
      }, []);

      it('TINY-12058: editor.licenseKeyManager should be defined', () => {
        const editor = hook.editor();
        assert.isObject(editor.licenseKeyManager);
        assert.isFunction(editor.licenseKeyManager.validate);
      });

      it('TINY-12058: validate should return true by default', async () => {
        const editor = hook.editor();
        const result = await editor.licenseKeyManager.validate({});
        assert.isFalse(result);
      });
    });
  });

  context('GPL License Key Manager', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl'
    });

    it('TINY-12058: editor.licenseKeyManager should be defined', () => {
      const editor = hook.editor();
      assert.isObject(editor.licenseKeyManager);
      assert.isFunction(editor.licenseKeyManager.validate);
    });

    it('TINY-12058: validate should return true by default', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate({});
      assert.isTrue(result);
    });

    it('TINY-12058: validate should return false when given any plugin', async () => {
      const editor = hook.editor();
      const result = await editor.licenseKeyManager.validate({ plugin: 'foo' });
      assert.isFalse(result);
    });
  });
});
