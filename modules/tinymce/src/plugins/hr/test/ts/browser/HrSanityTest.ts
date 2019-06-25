import { ApproxStructure, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import HrPlugin from 'tinymce/plugins/hr/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.HrSanitytest', (success, failure) => {

  HrPlugin();
  SilverTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, Log.steps('TBA', 'HorizontalRule: Click on the horizontal rule toolbar button and assert hr is added to the editor', [
      tinyUi.sClickOnToolbar('click on hr button', 'button[aria-label="Horizontal line"]'),
      tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
        return s.element('body', {
          children: [
            s.element('hr', {}),
            s.anything()
          ]
        });
      }))
    ]), onSuccess, onFailure);
  }, {
    plugins: 'hr',
    toolbar: 'hr',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
