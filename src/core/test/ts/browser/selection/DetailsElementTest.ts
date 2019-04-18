import { GeneralSteps, Logger, Pipeline, ApproxStructure } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.selection.DetailsElementTest', (success, failure) => {
  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Should should retain open attribute if it is not opened', GeneralSteps.sequence([
        tinyApis.sSetContent('<details><summary>a</summary>b</details>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('details', {
                attrs: {
                  'open': str.is('open'),
                  'data-mce-open': str.none('Should not have a data attr')
                },
                children: [
                  s.element('summary', {
                    children: [
                      s.text(str.is('a'))
                    ]
                  }),
                  s.text(str.is('b'))
                ]
              })
            ]
          });
        })),
        tinyApis.sAssertContent('<details><summary>a</summary>b</details>')
      ])),
      Logger.t('Should should retain open attribute if it opened', GeneralSteps.sequence([
        tinyApis.sSetContent('<details open="open"><summary>a</summary>b</details>'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: [
              s.element('details', {
                attrs: {
                  'open': str.is('open'),
                  'data-mce-open': str.is('open')
                },
                children: [
                  s.element('summary', {
                    children: [
                      s.text(str.is('a'))
                    ]
                  }),
                  s.text(str.is('b'))
                ]
              })
            ]
          });
        })),
        tinyApis.sAssertContent('<details open="open"><summary>a</summary>b</details>')
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
