import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import BbcodePlugin from 'tinymce/plugins/bbcode/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.bbcode.BbcodeSanityTest', (success, failure) => {

  BbcodePlugin();
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'BBCode: Set bbcode content and assert the equivalent html structure is present', [
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
    ]), onSuccess, onFailure);
  }, {
    plugins: 'bbcode',
    toolbar: 'bbcode',
    base_url: '/project/tinymce/js/tinymce',
    bbcode_dialect: 'punbb'
  }, success, failure);
});
