import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

import I18n from 'tinymce/core/api/util/I18n';

describe('browser.tinymce.core.util.I18nTest', () => {
  it('Translate strings', () => {
    const translate = I18n.translate;

    I18n.add('code', {
      'text': 'text translation',
      'text translation': 'this should return the wrong translation when a translation matches a key, in nested translate calls',
      'value:{0}{1}': 'value translation:{0}{1}',
      'text{context:something}': 'text translation with context',
      'value:{0}{1}{context:something}': 'value translation:{0}{1} with context',
      'empty string': ''
    });

    I18n.setCode('code');

    assert.equal(translate('text'), 'text translation');
    assert.equal(translate('untranslated text'), 'untranslated text');
    assert.equal(translate([ 'untranslated value:{0}{1}', 'a', 'b' ]), 'untranslated value:ab');
    assert.equal(translate([ 'value:{0}{1}', 'a', 'b' ]), 'value translation:ab');
    assert.equal(translate('untranslated text{context:context}'), 'untranslated text');
    assert.equal(translate([ 'untranslated value:{0}{1}{context:something}', 'a', 'b' ]), 'untranslated value:ab');
    assert.equal(translate([ 'value:{0}{1}{context:something}', 'a', 'b' ]), 'value translation:ab with context');

    // check if translate survives some awkward cases
    assert.deepEqual(translate('empty string'), '');
    assert.equal(translate([ 'untranslated value:{0}{1}', 'a' ]), 'untranslated value:a{1}',
      `Do not strip tokens that weren't replaced.`);

    assert.equal(translate([{ }]), '[object Object]');
    assert.equal(translate(Fun.noop), '[object Function]');

    assert.equal(translate(null), '');
    assert.equal(translate(undefined), '');
    assert.equal(translate(0), '0', '0');
    assert.equal(translate(true), 'true', 'true');
    assert.equal(translate(false), 'false', 'false');

    assert.equal(translate({}), '[object Object]', '[object Object]');
    assert.equal(translate({ raw: '' }), '', 'empty string');
    assert.equal(translate({ raw: false }), 'false', 'false');
    assert.equal(translate({ raw: undefined }), '');
    assert.equal(translate({ raw: null }), '');

    // https://github.com/tinymce/tinymce/issues/3029
    assert.equal(translate('hasOwnProperty'), 'hasOwnProperty');
    I18n.add('code', {
      hasOwnProperty: 'good'
    });
    assert.equal(translate('hasOwnProperty'), 'good');

    // Translate is case insensitive
    assert.equal(translate('TeXt'), 'text translation');
    assert.equal(translate('Value:{0}{1}{context:someThinG}'), 'value translation:{0}{1} with context');

    // can be called multiple times
    assert.equal(translate(translate(translate(translate('value:{0}{1}')))), 'value translation:{0}{1}');

    // When any translation string is the same as a key, a wrong translation will be made in nested translation calls.
    assert.equal(translate(translate(translate(translate('text')))), 'this should return the wrong translation when a translation matches a key, in nested translate calls');

    I18n.setCode('en');
  });

  it('Switch language', () => {
    I18n.add('code1', {
      text: 'translation1'
    });

    assert.equal(I18n.getCode(), 'en', 'Should not have switched language code');
    assert.isFalse(I18n.isRtl(), 'Should not be in in rtl mode');
    assert.equal(I18n.translate('text'), 'text', 'Should not get code1 translation');

    I18n.add('code2', {
      _dir: 'rtl',
      text: 'translation2'
    });

    I18n.setCode('code2');
    assert.equal(I18n.getCode(), 'code2', 'Should have switched language code');
    assert.isTrue(I18n.isRtl(), 'Should be in in rtl mode');
    assert.equal(I18n.translate('text'), 'translation2', 'Should be get code2 translation');

    I18n.setCode('en');
  });

  context('Case sensitive translations', () => {
    const addTranslationsAndSetCode = (code: string, translations: Record<string, string>) => {
      I18n.add(code, translations);
      I18n.setCode(code);
    };

    const assertTranslation = (key: string, expectedTranslation: string) =>
      assert.equal(I18n.translate(key), expectedTranslation);

    it('All case sensitive variants of duplicate keys should be preserved where a lowercase variant is already present', () => {
      addTranslationsAndSetCode('code-ci1', {
        test: 'test',
        Test: 'Test',
        TEST: 'TEST'
      });

      assertTranslation('test', 'test');
      assertTranslation('Test', 'Test');
      assertTranslation('TEST', 'TEST');
    });

    it('All case sensitive variants of duplicate keys should be preserved and a lowercase variant should be added where a lowercase variant is not present', () => {
      addTranslationsAndSetCode('code-ci1', {
        Test: 'Test',
        TEST: 'TEST'
      });

      assert.oneOf(I18n.translate('test'), [ 'Test', 'TEST' ]);
      assertTranslation('Test', 'Test');
      assertTranslation('TEST', 'TEST');
    });
  });
});
