import { Assertions, Pipeline, Step, Waiter, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Class, Css, Element } from '@ephox/sugar';

import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { StyleSheetLoader } from 'tinymce/core/dom/StyleSheetLoader';
import { Editor } from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.plugins.visualblocks.PreviewFormatsTest', (success, failure) => {
  const pluginCss = '/project/src/plugins/visualblocks/main/css/visualblocks.css';

  Theme();
  VisualBlocksPlugin();

  const sWaitForPluginCss = (editor: Editor) => Step.async((next, die) => {
    // The plugin can't leverage core functions to help, but tests can!
    StyleSheetLoader(editor.getDoc()).load(pluginCss, next, die);
  });

  const sWaitForVisualBlocks = function (editor) {
    return Waiter.sTryUntil('Wait for background css to be applied to first element', Step.sync(function () {
      const p = Element.fromDom(editor.getBody().firstChild);
      const background = Css.get(p, 'background-image');
      Assertions.assertEq('Paragraph should have a url background', true, background.indexOf('url(') === 0);
    }), 100, 3000);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'VisualBlocks: Toggle on/off visualblocks and compute previews', [
        tinyApis.sExecCommand('mceVisualBlocks'),
        sWaitForPluginCss(editor),
        sWaitForVisualBlocks(editor),
        Step.sync(function () {
          Assertions.assertEq('Visual blocks class should exist', true, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
        }),
        tinyApis.sExecCommand('mceVisualBlocks'),
        Step.sync(function () {
          Assertions.assertEq('Visual blocks class should not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
          Assertions.assertEq('Visual blocks class should still not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
        })
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'visualblocks',
    toolbar: 'visualblocks',
    visualblocks_content_css: pluginCss,
    base_url: '/project/js/tinymce'
  }, success, failure);
});
