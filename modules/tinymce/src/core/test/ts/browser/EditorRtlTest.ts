import { Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import EditorManager from 'tinymce/core/api/EditorManager';
import I18n from 'tinymce/core/api/util/I18n';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorRtlTest', (success, failure) => {
  Theme();

  const sAssertRtl = (label: string, rtl: boolean) => Step.sync(() => {
    Assert.eq(label, rtl, I18n.isRtl());
  });

  const sSetLangCode = (code: string) => Step.sync(() => {
    I18n.setCode(code);
  });

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  I18n.setCode('en');

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      sAssertRtl('Should be in rtl mode after creating an editor in arabic', true),
      sSetLangCode('en'),
      sAssertRtl('Should not be in rtl mode when switching back to english', false),
      sSetLangCode('ar'),
      sAssertRtl('Should be in rtl mode after switching back to arabic', true),
      sSetLangCode('en')
    ], () => {
      onSuccess();
    }, onFailure);
  }, {
    language: 'ar',
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
