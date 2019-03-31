import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.visualblocks.VisualBlocksSanityTest', (success, failure) => {

    Theme();
    VisualBlocksPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      Pipeline.async({}, Log.steps('TBA', 'VisualBlocks: Assert visual blocks are not present, click on the visual blocks button and assert they are present, click on the button again and assert they are not present', [
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.not('mce-visualblocks')
            ]
          });
        })),
        tinyUi.sClickOnToolbar('click visualblocks button', 'button'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.has('mce-visualblocks')
            ]
          });
        })),
        tinyUi.sClickOnToolbar('click visualblocks button', 'button'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.not('mce-visualblocks')
            ]
          });
        }))
      ]), onSuccess, onFailure);
    }, {
      plugins: 'visualblocks',
      toolbar: 'visualblocks',
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
  }
);
