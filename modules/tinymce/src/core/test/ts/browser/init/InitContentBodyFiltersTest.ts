import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { Arr } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.init.InitContentBodyFiltersTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-4742', 'Insert content to activate node filters, check content is in editor', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p style="color: rgb(255, 0, 0);">abc</p>'),
        // If an exception occurs, then no content will be inserted into the editor
        tinyApis.sAssertContent('<p>abc</p>'),
      ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.parser.addNodeFilter('p', (nodes) => {
          Arr.each(nodes, (node) => {
            // Remove style attributes from node
            node.attr('style', null);
            node.attr('data-mce-style', null);
          });
        });
      });
    },
  }, success, failure);
});
