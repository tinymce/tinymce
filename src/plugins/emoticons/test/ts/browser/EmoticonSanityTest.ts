import { ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import EmoticonPlugin from 'tinymce/plugins/emoticons/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.emoticons.EmoticonSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  EmoticonPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click on emoticons button', 'div[aria-label="Emoticons"] > button'),
      tinyUi.sClickOnUi('click on kiss', 'a[aria-label="kiss"]'),
      tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('img', {
                  attrs: {
                    alt: str.is('kiss')
                  }
                })
              ]
            })
          ]
        });
      }))
    ], onSuccess, onFailure);
  }, {
    plugins: 'emoticons',
    toolbar: 'emoticons',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
