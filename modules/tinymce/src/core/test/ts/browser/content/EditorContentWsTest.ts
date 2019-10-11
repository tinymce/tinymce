import { Chain, Pipeline, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.EditorContentWsTest', (success, failure) => {
  Theme();

  Pipeline.async({}, [
    Logger.t('Editor initialized on pre element should retain whitespace on get/set content', Chain.asStep({}, [
      Editor.cFromHtml('<pre>  a  </pre>', {
        inline: true,
        base_url: '/project/tinymce/js/tinymce'
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
