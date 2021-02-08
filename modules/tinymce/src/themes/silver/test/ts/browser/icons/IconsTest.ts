import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { get, IconProvider } from 'tinymce/themes/silver/ui/icons/Icons';

describe('browser.tinymce.themes.silver.icons.IconsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  const iconIndent = getAllOxide().indent;
  const iconDefault = getAllOxide()['temporary-placeholder'];
  const myCustomIcon = '<svg></svg>';

  const iconProvider: IconProvider = () => hook.editor().ui.registry.getAll().icons;
  const emptyIconProvider: IconProvider = () => ({ });
  const lowerCaseProvider: IconProvider = () => ({ mycustomicon: '<svg></svg>' });

  it('When an icon exists as a default icon or provided, it should be returned', () => {
    assert.equal(get('indent', iconProvider), iconIndent);
  });

  it('When a lowercase version of a mixed-case name exists, it should be returned', () => {
    assert.equal(get('myCustomIcon', lowerCaseProvider), myCustomIcon);
  });

  it('When an icon does not exist as a default icon, the temporary placeholder or fallback icon should be returned', () => {
    assert.equal(get('temp_icon', iconProvider), iconDefault);
  });

  it('When a default icon or fallback does not exist, !not found! should be returned', () => {
    assert.equal(get('indent', emptyIconProvider), '!not found!');
  });
});
