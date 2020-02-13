import { Chain, Keys, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ActionChains, ApiChains, Editor } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyInlineTest', function (success, failure) {

  Theme();

  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  };

  Pipeline.async({}, [
    Logger.t('Pressing shift+enter in brMode inside a h1 should insert a br', Chain.asStep({}, [
      Editor.cFromHtml('<h1>ab</h1>', { ...settings, forced_root_block: false }),
      ApiChains.cFocus,
      ApiChains.cSetCursor([ 0 ], 1),
      ActionChains.cContentKeystroke(Keys.enter(), { shift: true }),
      ApiChains.cAssertContent('a<br />b'),
      Editor.cRemove
    ]))
  ], function () {
    success();
  }, failure);
});
