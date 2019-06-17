import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import DirectionalityPlugin from 'tinymce/plugins/directionality/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.plugins.directionality.DirectionalitySanityTest', (success, failure) => {

    DirectionalityPlugin();
    SilverTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyUi = TinyUi(editor);
      const tinyApis = TinyApis(editor);

      Pipeline.async({},
        Log.steps('TBA', 'Directionality: Set and select content, click on the Right to left toolbar button and assert direction is right to left. Now, click on the Left to right button and assert direction is left to right', [
          tinyApis.sSetContent('a'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
          tinyUi.sClickOnToolbar('click on ltr btn', 'button[title="Right to left"]'),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  attrs: {
                    dir: str.is('rtl')
                  }
                })
              ]
            });
          })),
          tinyUi.sClickOnToolbar('click on rtl btn', 'button[title="Left to right"]'),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  attrs: {
                    dir: str.is('ltr')
                  }
                })
              ]
            });
          }))
        ])
      , onSuccess, onFailure);
    }, {
      plugins: 'directionality',
      toolbar: 'ltr rtl',
      base_url: '/project/tinymce/js/tinymce',
      theme: 'silver'
    }, success, failure);
  }
);
