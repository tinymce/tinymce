import { Assertions, Chain, Guard, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteSettingsTest', (success, failure) => {
  Theme();
  Plugin();

  const cCreateInlineEditor = function (settings) {
    return Chain.control(
      McEditor.cFromSettings({
        ...settings,
        inline: true,
        base_url: '/project/tinymce/js/tinymce'
      }),
      Guard.addLogging('Create inline editor')
    );
  };

  const cRemoveEditor = Chain.control(
    McEditor.cRemove,
    Guard.addLogging('Remove editor')
  );

  Pipeline.async({}, [
    Chain.asStep({}, Log.chains('TBA', 'Paste: paste_as_text setting', [
      cCreateInlineEditor({
        paste_as_text: true,
        plugins: 'paste'
      }),
      Chain.op(function (editor) {
        Assertions.assertEq('Should be text format', 'text', editor.plugins.paste.clipboard.pasteFormat.get());
      }),
      cRemoveEditor
    ]))
  ], function () {
    success();
  }, failure);
});
