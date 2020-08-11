import { Chain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorOnHiddenElementTest', function (success, failure) {

  Theme();

  // Firefox specific test, errors were thrown when the editor was initialised on hidden element.
  Chain.pipeline([
    Editor.cFromHtml('<textarea style="display:none;"></textarea>', {
      base_url: '/project/tinymce/js/tinymce'
    }),
    ApiChains.cFocus
  ],
  function () {
    success();
  }, failure);
});
