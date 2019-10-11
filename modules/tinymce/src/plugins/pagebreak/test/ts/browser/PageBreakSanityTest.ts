import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import PageBreakPlugin from 'tinymce/plugins/pagebreak/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.pagebreak.PageBreakSanityTest', (success, failure) => {

  Theme();
  PageBreakPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'PageBreak: Click on the pagebreak toolbar button and assert pagebreak is inserted', [
      tinyUi.sClickOnToolbar('click on pagebreak button', 'button[aria-label="Page break"]'),
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
    ]), onSuccess, onFailure);
  }, {
    plugins: 'pagebreak',
    toolbar: 'pagebreak',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
