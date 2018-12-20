import { Assertions, Chain, Pipeline, Guard, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Merger } from '@ephox/katamari';

import EditorManager from 'tinymce/core/api/EditorManager';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import ViewBlock from '../module/test/ViewBlock';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteSettingsTest', (success, failure) => {
  const viewBlock = ViewBlock();

  Theme();
  Plugin();

  const cCreateInlineEditor = function (settings) {
    return Chain.control(
      Chain.async(function (viewBlock: any, next, die) {
        viewBlock.update('<div id="inline-tiny"></div>');

        EditorManager.init(Merger.merge({
          selector: '#inline-tiny',
          inline: true,
          base_url: '/project/js/tinymce',
          setup (editor) {
            editor.on('SkinLoaded', function () {
              next(editor);
            });
          }
        }, settings));
      }),
      Guard.addLogging('Create inline editor')
    );
  };

  const cRemoveEditor = Chain.control(
    Chain.op(function (editor: any) {
      editor.remove();
    }),
    Guard.addLogging('Remove editor')
  );

  viewBlock.attach();
  Pipeline.async({}, [
    Chain.asStep(viewBlock, Log.chains('TBA', 'Paste: paste_as_text setting', [
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
    viewBlock.detach();
    success();
  }, failure);
});
