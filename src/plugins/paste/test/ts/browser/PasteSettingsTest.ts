import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Merger } from '@ephox/katamari';

import EditorManager from 'tinymce/core/api/EditorManager';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

import ViewBlock from '../module/test/ViewBlock';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteSettingsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  Theme();
  Plugin();

  const cCreateInlineEditor = function (settings) {
    return Chain.on(function (viewBlock, next, die) {
      viewBlock.update('<div id="inline-tiny"></div>');

      EditorManager.init(Merger.merge({
        selector: '#inline-tiny',
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray',
        setup (editor) {
          editor.on('SkinLoaded', function () {
            next(Chain.wrap(editor));
          });
        }
      }, settings));
    });
  };

  const cRemoveEditor = Chain.op(function (editor) {
    editor.remove();
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('paste_as_text setting', Chain.asStep(viewBlock, [
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
