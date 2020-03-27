import { Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('browser.tinymce.core.util.I18nTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('Translate strings', function () {
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

    LegacyUnit.equal(translate('text'), 'text translation');
    LegacyUnit.equal(translate('untranslated text'), 'untranslated text');
    LegacyUnit.equal(translate([ 'untranslated value:{0}{1}', 'a', 'b' ]), 'untranslated value:ab');
    LegacyUnit.equal(translate([ 'value:{0}{1}', 'a', 'b' ]), 'value translation:ab');
    LegacyUnit.equal(translate('untranslated text{context:context}'), 'untranslated text');
    LegacyUnit.equal(translate([ 'untranslated value:{0}{1}{context:something}', 'a', 'b' ]), 'untranslated value:ab');
    LegacyUnit.equal(translate([ 'value:{0}{1}{context:something}', 'a', 'b' ]), 'value translation:ab with context');

    // check if translate survives some awkward cases
    LegacyUnit.deepEqual(translate('empty string'), '');
    LegacyUnit.equal(translate([ 'untranslated value:{0}{1}', 'a' ]), 'untranslated value:a{1}',
      `Do not strip tokens that weren't replaced.`);

    LegacyUnit.equal(translate([{ }]), '[object Object]');
    LegacyUnit.equal(translate(function () { }), '[object Function]');

    LegacyUnit.equal(translate(null), '');
    LegacyUnit.equal(translate(undefined), '');
    LegacyUnit.equal(translate(0), '0', '0');
    LegacyUnit.equal(translate(true), 'true', 'true');
    LegacyUnit.equal(translate(false), 'false', 'false');

    LegacyUnit.equal(translate({}), '[object Object]', '[object Object]');
    LegacyUnit.equal(translate({ raw: '' }), '', 'empty string');
    LegacyUnit.equal(translate({ raw: false }), 'false', 'false');
    LegacyUnit.equal(translate({ raw: undefined }), '');
    LegacyUnit.equal(translate({ raw: null }), '');

    // https://github.com/tinymce/tinymce/issues/3029
    LegacyUnit.equal(translate('hasOwnProperty'), 'hasOwnProperty');
    I18n.add('code', {
      hasOwnProperty: 'good'
    });
    LegacyUnit.equal(translate('hasOwnProperty'), 'good');

    // Translate is case insensitive
    LegacyUnit.equal(translate('TeXt'), 'text translation');
    LegacyUnit.equal(translate('Value:{0}{1}{context:someThinG}'), 'value translation:{0}{1} with context');

    // can be called multiple times
    LegacyUnit.equal(translate(translate(translate(translate('value:{0}{1}')))), 'value translation:{0}{1}');

    // When any translation string is the same as a key, a wrong translation will be made in nested translation calls.
    LegacyUnit.equal(translate(translate(translate(translate('text')))), 'this should return the wrong translation when a translation matches a key, in nested translate calls');

    I18n.setCode('en');
  });

  suite.test('Switch language', function () {
    I18n.add('code1', {
      text: 'translation1'
    });

    Assert.eq('Should not have switched language code', 'en', I18n.getCode());
    Assert.eq('Should not be in in rtl mode', false, I18n.isRtl());
    Assert.eq('Should not get code1 translation', 'text', I18n.translate('text'));

    I18n.add('code2', {
      _dir: 'rtl',
      text: 'translation2'
    });

    I18n.setCode('code2');
    Assert.eq('Should have switched language code', 'code2', I18n.getCode());
    Assert.eq('Should be in in rtl mode', true, I18n.isRtl());
    Assert.eq('Should be get code2 translation', 'translation2', I18n.translate('text'));

    I18n.setCode('en');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
