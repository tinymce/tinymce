import { ApproxStructure, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import PageBreakPlugin from 'tinymce/plugins/pagebreak/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.pagebreak.PageBreakSanityTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  PageBreakPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyUi.sClickOnToolbar('click on pagebreak button', 'div[aria-label="Page break"] > button'),
      tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str, arr) {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('img', {
                  classes: [
                    arr.has('mce-pagebreak')
                  ]
                })
              ]
            })
          ]
        });
      }))

    ], onSuccess, onFailure);
  }, {
    plugins: 'pagebreak',
    toolbar: 'pagebreak',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
