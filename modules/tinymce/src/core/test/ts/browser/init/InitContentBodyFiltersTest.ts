import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.init.InitContentBodyFiltersTest', (success, failure) => {
  Theme();
  const attrs = 'style|contenteditable|type|src|data|controls|width|height';

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-4742', 'Insert content to activate node filters, check content is in editor', [
        tinyApis.sFocus(),
        tinyApis.sSetContent('<p style="color: rgb(255, 0, 0);">abc</p>'),
        // If an exception occurs, then no content will be inserted into the editor
        tinyApis.sAssertContent('<p>abc</p>')
      ]),
      Log.stepsAsStep('TINY-4211', 'Insert media content and check contenteditable attributes added/retained', [
        tinyApis.sFocus(),
        tinyApis.sSetContent(
          '<p><video src="custom/video.mp4" controls="controls"></video></p>' +
          '<p><audio src="custom/audio.mp3" controls="controls"></audio></p>' +
          '<p><embed type="video/webm" src="custom/video.mp4" width="100" height="100" /></p>' +
          '<p><object type="application/pdf" data="custom/file.pdf" width="100" height="100"></object></p>'
        ),
        tinyApis.sAssertContentPresence({
          'video[contenteditable=false]': 1,
          'audio[contenteditable=false]': 1,
          'embed[contenteditable=false]': 1,
          'object[contenteditable=false]': 1,
          '*[data-mce-contenteditable]': 0
        }),
        tinyApis.sAssertContent(
          '<p><video src="custom/video.mp4" controls="controls"></video></p>' +
          '<p><audio src="custom/audio.mp3" controls="controls"></audio></p>' +
          '<p><embed type="video/webm" src="custom/video.mp4" width="100" height="100" /></p>' +
          '<p><object type="application/pdf" data="custom/file.pdf" width="100" height="100"></object></p>'
        ),
        tinyApis.sSetContent(
          '<p><video contenteditable="false" src="custom/video.mp4" controls="controls"></video></p>'
        ),
        tinyApis.sAssertContentPresence({
          'video[contenteditable=false]': 1,
          'video[data-mce-contenteditable=false]': 1
        }),
        tinyApis.sAssertContent(
          '<p><video contenteditable="false" src="custom/video.mp4" controls="controls"></video></p>'
        )
      ])
    ], onSuccess, onFailure);
  }, {
    indent: false,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    valid_elements: `p[${attrs}],video[${attrs}],audio[${attrs}],embed[${attrs}],object[${attrs}]`,
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
    }
  }, success, failure);
});
