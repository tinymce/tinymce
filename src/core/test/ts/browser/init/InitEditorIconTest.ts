import { Assertions, Pipeline, UiFinder, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import IconManager from 'tinymce/core/api/IconManager';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorIconTest', (success, failure) => {

  Theme();

  const italicIconSvg = '<svg width="24" height="24"><path d="M16.7 4.7l-.1.9h-.3c-.6 0-1 0-1.4.3-.3.3-.4.6-.5 1.1l-2.1 9.8v.6c0 .5.4.8 1.4.8h.2l-.2.8H8l.2-.8h.2c1.1 0 1.8-.5 2-1.5l2-9.8.1-.5c0-.6-.4-.8-1.4-.8h-.3l.2-.9h5.8z" fill-rule="evenodd"/></svg>';

  // Add a custom icon pack
  const customIconPack = {
    icons: {
      'bold': 'bold-custom',
      'custom-icon': 'custom'
    }
  };
  IconManager.add('custom', customIconPack);

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const icons = editor.ui.registry.getAll().icons;

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Icon pack isn\'t loaded remotely, if already defined', [
        UiFinder.sNotExists(Body.body(), '.tox-notification'),
        Assertions.sAssertEq('Custom icon pack not overridden', customIconPack, IconManager.get('custom'))
      ]),
      Log.stepsAsStep('TBA', 'Icon overrides', [
        Assertions.sAssertEq('Manual icon override', 'override-icon', icons['custom-icon']),
        Assertions.sAssertEq('Icon pack icon', 'bold-custom', icons.bold),
        Assertions.sAssertEq('Default pack icon', italicIconSvg, icons.italic)
      ])
    ], onSuccess, onFailure);
  }, {
    icons: 'custom',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      editor.ui.registry.addIcon('custom-icon', 'override-icon');
    }
  }, success, failure);
});
