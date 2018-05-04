import { Chain, Pipeline, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { ApiChains, Editor } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.core.content.EditorContentWsTest', (success, failure) => {
  ModernTheme();

  Pipeline.async({}, [
    Logger.t('Editor initialized on pre element should retain whitespace on get/set content', Chain.asStep({}, [
      Editor.cFromHtml('<pre>  a  </pre>', {
        inline: true,
        skin_url: '/project/js/tinymce/skins/lightgray'
      }),
      ApiChains.cAssertContent('  a  '),
      ApiChains.cSetContent('  b  '),
      ApiChains.cAssertContent('  b  '),
      Editor.cRemove
    ]))
  ], function () {
    success();
  }, failure);
});
