
import { after, afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as LicenseKeyValidation from 'tinymce/core/init/LicenseKeyValidation';

describe('browser.tinymce.core.init.LicenseKeyValidationTest', () => {
  let oldWarn: typeof console.warn;
  let messages: string[] = [];
  const expectedLogMessage = `TinyMCE is running in evaluation mode. Provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. Read more at https://www.tiny.cloud/license-key/`;
  const invalidGeneratedKeyToShort = Arr.range(63, Fun.constant('x')).join('');
  const invalidGeneratedKeyToLong = Arr.range(512, Fun.constant('x')).join('');
  const validGeneratedKey = Arr.range(67, Fun.constant('x')).join('');

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

  context('LicenseKeyValidator API', () => {
    before(beforeHandler);
    after(afterHandler);

    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    });

    afterEach(() => {
      hook.editor().options.unset('license_key');
    });

    it('validateLicenseKey GPL', () => {
      assert.equal(LicenseKeyValidation.validateLicenseKey('GPL'), 'VALID');
      assert.equal(LicenseKeyValidation.validateLicenseKey('gPl'), 'VALID');
      assert.equal(LicenseKeyValidation.validateLicenseKey('gpl'), 'VALID');
    });

    it('validateLicenseKey generated', () => {
      assert.equal(LicenseKeyValidation.validateLicenseKey(invalidGeneratedKeyToShort), 'INVALID', 'To short');
      assert.equal(LicenseKeyValidation.validateLicenseKey(invalidGeneratedKeyToLong), 'INVALID', 'To to long');
      assert.equal(LicenseKeyValidation.validateLicenseKey(validGeneratedKey), 'VALID', 'Is valid');
    });

    it('validateEditorLicenseKey no license key set', () => {
      messages = [];
      LicenseKeyValidation.validateEditorLicenseKey(hook.editor());
      assert.deepEqual(messages, [ expectedLogMessage ], 'Should produce a message since license_key is missing');
    });

    it('validateEditorLicenseKey GPL license key set', () => {
      const editor = hook.editor();

      messages = [];
      editor.options.set('license_key', 'gpl');
      LicenseKeyValidation.validateEditorLicenseKey(hook.editor());
      assert.deepEqual(messages, [ ], 'Should not produce a message since GPL is valid');
    });

    it('validateEditorLicenseKey generated valid license key set', () => {
      const editor = hook.editor();

      messages = [];
      editor.options.set('license_key', validGeneratedKey);
      LicenseKeyValidation.validateEditorLicenseKey(hook.editor());
      assert.deepEqual(messages, [ ], 'Should not produce a message since generated key is valid');
    });

    it('validateEditorLicenseKey api_key set but no license_key', () => {
      const editor = hook.editor();

      messages = [];
      editor.options.set('api_key', 'some-api-key');
      LicenseKeyValidation.validateEditorLicenseKey(hook.editor());
      assert.deepEqual(messages, [ ], 'Should not produce a message since an api_key was provided');
      editor.options.unset('api_key');
    });
  });

  context('No license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    TinyHooks.bddSetupLight<Editor>({
      license_key: undefined,
      base_url: '/project/tinymce/js/tinymce'
    });

    it('Should have warned while initializing the editor', () => {
      assert.deepEqual(messages, [ expectedLogMessage ]);
    });
  });

  context('GPL license key specified', () => {
    before(beforeHandler);
    after(afterHandler);

    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      license_key: 'gpl'
    });

    it('Should not have any warning messages since gpl was provided', () => {
      assert.deepEqual(messages, []);
    });
  });

  context('Invalid license key specified', () => {
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

  context('api_key specified', () => {
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
