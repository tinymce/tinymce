import { Chain,  Keys,  Logger,  Pipeline } from '@ephox/agar';
import { Merger } from '@ephox/katamari';
import { ActionChains, ApiChains, Editor } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.EnterKeyInlineTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const settings = {
    skin_url: '/project/js/tinymce/skins/lightgray',
    inline: true
  };

  Pipeline.async({}, [
    Logger.t('Pressing shift+enter in brMode inside a h1 should insert a br', Chain.asStep({}, [
      Editor.cFromHtml('<h1>ab</h1>', Merger.merge(settings, { forced_root_block: false })),
      ApiChains.cFocus,
      ApiChains.cSetCursor([0], 1),
      ActionChains.cContentKeystroke(Keys.enter(), { shift: true }),
      ApiChains.cAssertContent('a<br />b'),
      Editor.cRemove
    ]))
  ], function () {
    success();
  }, failure);
});
