import { ApproxStructure, Pipeline } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import BbcodePlugin from 'tinymce/plugins/bbcode/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.bbcode.BbcodeSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  BbcodePlugin();
  ModernTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sSetContent('[b]a[/b]'),
      tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('strong', {
                  children: [
                    s.text(str.is('a'))
                  ]
                })
              ]
            })
          ]
        });
      }))
    ], onSuccess, onFailure);
  }, {
    plugins: 'bbcode',
    toolbar: 'bbcode',
    skin_url: '/project/js/tinymce/skins/lightgray',
    bbcode_dialect: 'punbb'
  }, success, failure);
});
