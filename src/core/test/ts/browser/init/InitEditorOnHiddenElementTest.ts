import { Chain } from '@ephox/agar';
import { ApiChains, Editor } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorOnHiddenElementTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();

  // Firefox specific test, errors were thrown when the editor was initialised on hidden element.
  Chain.pipeline([
    Editor.cFromHtml('<textarea style="display:none;"></textarea>', {
      skin_url: '/project/js/tinymce/skins/lightgray'
    }),
    ApiChains.cFocus
  ],
  function () {
    success();
  }, failure);
});
