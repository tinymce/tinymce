import { Assertions, Log, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Class, Css, SugarElement } from '@ephox/sugar';

import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.visualblocks.PreviewFormatsTest', (success, failure) => {
  Theme();
  VisualBlocksPlugin();

  const sWaitForVisualBlocks = (editor) => {
    return Waiter.sTryUntil('Wait for background css to be applied to first element', Step.sync(() => {
      const p = SugarElement.fromDom(editor.getBody().firstChild);
      const background = Css.get(p, 'background-image');
      Assertions.assertEq('Paragraph should have a url background', true, background.indexOf('url(') === 0);
    }));
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({},
      Log.steps('TBA', 'VisualBlocks: Toggle on/off visualblocks and compute previews', [
        tinyApis.sExecCommand('mceVisualBlocks'),
        sWaitForVisualBlocks(editor),
        Step.sync(() => {
          Assertions.assertEq('Visual blocks class should exist', true, Class.has(SugarElement.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
        }),
        tinyApis.sExecCommand('mceVisualBlocks'),
        Step.sync(() => {
          Assertions.assertEq('Visual blocks class should not exist', false, Class.has(SugarElement.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
          Assertions.assertEq('Visual blocks class should still not exist', false, Class.has(SugarElement.fromDom(editor.getBody()), 'mce-visualblocks'));
        })
      ])
      , onSuccess, onFailure);
  }, {
    plugins: 'visualblocks',
    toolbar: 'visualblocks',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
