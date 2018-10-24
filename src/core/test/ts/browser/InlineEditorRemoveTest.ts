import { Pipeline, Logger, Chain, UiFinder } from '@ephox/agar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor, ApiChains } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.InlineEditorRemoveTest', (success, failure) =>  {
  Theme();

  const settings = {
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  };

  const cAssertBogusNotExist = Chain.async((val, next, die) => {
    UiFinder.findIn(Body.body(), '[data-mce-bogus]').fold(
      () => {
        next(val);
      },
      () => {
        die('Should not be any data-mce-bogus tags present');
      }
    );
  });

  const cRemoveEditor = Chain.op((editor: any) => editor.remove());

  Pipeline.async({}, [
    Logger.t('Removing inline editor should remove all data-mce-bogus tags', Chain.asStep({}, [
        McEditor.cFromHtml('<div></div>', settings),
        ApiChains.cSetRawContent('<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>'),
        cRemoveEditor,
        cAssertBogusNotExist,
        McEditor.cRemove,
      ]),
    )
  ], function () {
    success();
  }, failure);
});
