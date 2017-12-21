import { ApproxStructure } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import { TinyUi } from '@ephox/mcagar';
import DirectionalityPlugin from 'tinymce/plugins/directionality/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest(
  'browser.tinymce.plugins.directionality.DirectionalitySanityTest',
  function() {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    DirectionalityPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sSetContent('a'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        tinyUi.sClickOnToolbar('click on ltr btn', 'div[aria-label="Right to left"] > button'),
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
        tinyUi.sClickOnToolbar('click on rtl btn', 'div[aria-label="Left to right"] > button'),
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
      ], onSuccess, onFailure);
    }, {
      plugins: 'directionality',
      toolbar: 'ltr rtl',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);

