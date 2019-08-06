import { ApproxStructure, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';
import theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.nonbreaking.NonbreakingVisualCharsTest', (success, failure) => {

  theme();
  NonbreakingPlugin();
  VisualCharsPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-3647', 'NonBreaking+VisualChars: Click on the nbsp button and assert nonbreaking space is inserted', [
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
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', 'NonBreaking+VisualChars: Enable VisualChars then click on the nbsp button and assert nonbreaking span is inserted', [
        tinyUi.sClickOnToolbar('click on visualchars button', 'button[aria-label="Show invisible characters"]'),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('span', {
                    classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
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
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking visualchars',
    toolbar: 'nonbreaking visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
