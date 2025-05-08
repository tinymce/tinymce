
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.LicenseKeyTest', () => {
  let oldWarn: typeof console.warn;
  let messages: string[] = [];
  const expectedLogMessage = `TinyMCE is running in evaluation mode. Provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. Read more at https://www.tiny.cloud/license-key/`;
  // const invalidGeneratedKeyToShort = Arr.range(63, Fun.constant('x')).join('');
  // const invalidGeneratedKeyToLong = Arr.range(512, Fun.constant('x')).join('');
  // const validGeneratedKey = Arr.range(67, Fun.constant('x')).join('');

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

  // context('License key manager', () => {
  //   before(beforeHandler);
  //   after(afterHandler);

  //   TinyHooks.bddSetupLight<Editor>({
  //     license_key: undefined,
  //     license_key_url: '/project/tinymce/src/core/test/assets/licensing/enterprise.js',
  //     base_url: '/project/tinymce/js/tinymce'
  //   });

  //   it('test', () => {

  //   });

  // });

  context('No license key manager', () => {
    before(beforeHandler);
    after(afterHandler);

    const hook = TinyHooks.bddSetupLight<Editor>({
      license_key: undefined,
      // license_key_url: '/project/tinymce/src/core/test/assets/licensing/enterprise.js',
      base_url: '/project/tinymce/js/tinymce'
    });

    it('editor should not load', () => {
      const editor = hook.editor();
      assert.isFalse(editor.initialized);
    });
  });

  context.skip('No license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    TinyHooks.bddSetupLight<Editor>({
      license_key: undefined,
      // license_key_url: '/project/tinymce/src/core/test/assets/licensing/enterprise.js',
      base_url: '/project/tinymce/js/tinymce'
    });

    it('Should have warned while initializing the editor', () => {
      assert.deepEqual(messages, [ expectedLogMessage ]);
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
      const result = await editor.licenseKeyManager.verify!(editor);
      assert.isTrue(result);
    });

    it('TINY-12058: validate should return true by default', () => {
      const editor = hook.editor();
      const result = editor.licenseKeyManager.validate!(editor);
      assert.isTrue(result);
    });

    it('TINY-12058: validate should return false when given any plugin', () => {
      const editor = hook.editor();
      const result = editor.licenseKeyManager.validate!(editor, { plugin: 'foo' });
      assert.isFalse(result);
    });
  });

  context.skip('Invalid license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'foo'
    }, []);

    it('Should have warned while initializing the editor since the key is to short', () => {
      assert.deepEqual(messages, [ expectedLogMessage ]);
    });
  });

  context.skip('api_key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      api_key: 'some-api-key'
    });

    it('Should not have any warning messages since an api_key was provided', () => {
      assert.deepEqual(messages, []);
    });
  });
});
