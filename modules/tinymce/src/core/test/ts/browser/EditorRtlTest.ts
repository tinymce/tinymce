import { before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import EditorManager from 'tinymce/core/api/EditorManager';
import I18n from 'tinymce/core/api/util/I18n';

describe('browser.tinymce.core.EditorRtlTest', () => {
  before(() => {
    EditorManager.addI18n('ar', {
      Bold: 'Bold test',
      _dir: 'rtl'
    });

    I18n.setCode('en');
  });

  TinyHooks.bddSetupLight({
    language: 'ar',
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('I18n.isRtl', () => {
    assert.isTrue(I18n.isRtl(), 'Should be in rtl mode after creating an editor in arabic');
    I18n.setCode('en');
    assert.isFalse(I18n.isRtl(), 'Should not be in rtl mode when switching back to english');
    I18n.setCode('ar');
    assert.isTrue(I18n.isRtl(), 'Should be in rtl mode after switching back to arabic');
    I18n.setCode('en');
  });
});
