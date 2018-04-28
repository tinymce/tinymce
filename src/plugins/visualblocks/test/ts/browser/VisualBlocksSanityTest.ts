import { ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.visualblocks.VisualBlocksSanityTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    VisualBlocksPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);
      Pipeline.async({}, [
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.not('mce-visualblocks')
            ]
          });
        })),
        tinyUi.sClickOnToolbar('click visualblocks button', 'div[aria-label="Show blocks"] > button'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.has('mce-visualblocks')
            ]
          });
        })),
        tinyUi.sClickOnToolbar('click visualblocks button', 'div[aria-label="Show blocks"] > button'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            classes: [
              arr.not('mce-visualblocks')
            ]
          });
        }))
      ], onSuccess, onFailure);
    }, {
      plugins: 'visualblocks',
      toolbar: 'visualblocks',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);
