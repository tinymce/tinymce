import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.nonbreaking.NonbreakingSanityTest', (success, failure) => {

  theme();
  NonbreakingPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'NonBreaking: Click on the nbsp button and assert nonbreaking space is inserted', [
      tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
      tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap') ],
                  children: [
                    s.text(str.is('\u00a0'))
                  ]
                }),
                s.text(str.is('\uFEFF'))
              ]
            })
          ]
        });
      }))
    ]), onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking',
    toolbar: 'nonbreaking',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
