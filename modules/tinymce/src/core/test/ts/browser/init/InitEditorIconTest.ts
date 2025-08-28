import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { getAll as getDefaultIcons } from '@tinymce/oxide-icons-default';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import IconManager from 'tinymce/core/api/IconManager';

describe('browser.tinymce.core.init.InitEditorIconTest', () => {
  const overrideIcon = '<svg>override-icon</svg>';
  const hook = TinyHooks.bddSetupLight<Editor>({
    icons: 'custom',
    icons_url: '/project/tinymce/src/core/test/assets/icons/custom/icons.js',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.ui.registry.addIcon('custom-icon', overrideIcon);
    }
  }, []);

  // Copy of '/src/core/test/assets/icons/custom''. For assertion in test.
  const customIconPack = {
    icons: {
      'bold': '<svg>bold-custom</svg>',
      'custom-icon': '<svg>custom</svg>'
    }
  };

  it('TBA: Should have been able to load custom icon pack', () => {
    UiFinder.notExists(SugarBody.body(), '.tox-notification');
    assert.deepEqual(IconManager.get('custom'), customIconPack, 'IconManager should have custom icon pack');
  });

  it('TBA: Icon overrides', () => {
    const icons = hook.editor().ui.registry.getAll().icons;
    assert.equal(icons['custom-icon'], overrideIcon, 'Manual icon override');
    assert.equal(icons.bold, customIconPack.icons.bold, 'Icon pack icon');
    assert.equal(icons.italic, getDefaultIcons().italic, 'Default pack icon');
  });
});
