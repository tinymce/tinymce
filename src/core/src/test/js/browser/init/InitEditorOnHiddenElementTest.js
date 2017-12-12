import { Chain } from '@ephox/agar';
import { ApiChains } from '@ephox/mcagar';
import { Editor } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.init.InitEditorOnHiddenElementTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();

  // Firefox specific test, errors were thrown when the editor was initialised on hidden element.
  Chain.pipeline([
    Editor.cFromHtml('<textarea style="display:none;"></textarea>', {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }),
    ApiChains.cFocus
  ],
  function () {
    success();
  }, failure);
});

