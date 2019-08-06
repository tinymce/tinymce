import { Assertions, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import IconManager from 'tinymce/core/api/IconManager';
import { getAll as getDefaultIcons } from '@tinymce/oxide-icons-default';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorIconTest', (success, failure) => {
  Theme();

  // Copy of '/src/core/test/assets/icons/custom''. For assertion in test.
  const customIconPack = {
    icons: {
      'bold': '<svg>bold-custom</svg>',
      'custom-icon': '<svg>custom</svg>'
    }
  };

  const overrideIcon = '<svg>override-icon</svg>';

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const icons = editor.ui.registry.getAll().icons;

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Should have been able to load custom icon pack', [
        UiFinder.sNotExists(Body.body(), '.tox-notification'),
        Assertions.sAssertEq('IconManager should have custom icon pack', customIconPack, IconManager.get('custom'))
      ]),
      Log.stepsAsStep('TBA', 'Icon overrides', [
        Assertions.sAssertEq('Manual icon override', overrideIcon, icons['custom-icon']),
        Assertions.sAssertEq('Icon pack icon', customIconPack.icons.bold, icons.bold),
        Assertions.sAssertEq('Default pack icon', getDefaultIcons().italic, icons.italic)
      ])
    ], onSuccess, onFailure);
  }, {
    icons: 'custom',
    icons_url: '/project/tinymce/src/core/test/assets/icons/custom/icons.js',
    base_url: '/project/tinymce/js/tinymce',
    statusbar: false,
    menubar: false,
    setup: (editor) => {
      editor.ui.registry.addIcon('custom-icon', overrideIcon);
    }
  }, success, failure);
});
