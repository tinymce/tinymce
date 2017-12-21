import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Merger } from '@ephox/katamari';
import EditorManager from 'tinymce/core/EditorManager';
import ViewBlock from '../module/test/ViewBlock';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteSettingsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var viewBlock = new ViewBlock();

  Theme();
  Plugin();

  var cCreateInlineEditor = function (settings) {
    return Chain.on(function (viewBlock, next, die) {
      viewBlock.update('<div id="inline-tiny"></div>');

      EditorManager.init(Merger.merge({
        selector: '#inline-tiny',
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray',
        setup: function (editor) {
          editor.on('SkinLoaded', function () {
            next(Chain.wrap(editor));
          });
        }
      }, settings));
    });
  };

  var cRemoveEditor = Chain.op(function (editor) {
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
        Assertions.assertEq('Should be text format', 'text', editor.plugins.paste.clipboard.pasteFormat);
      }),
      cRemoveEditor
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});

