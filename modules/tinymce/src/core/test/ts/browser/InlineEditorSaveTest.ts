import { Pipeline, Logger, Chain, UiFinder } from '@ephox/agar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, ApiChains } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('browser.tinymce.core.InlineEditorSaveTest', (success, failure) =>  {
  Theme();

  const settings = {
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  };

  const cAssertBogusExist = Chain.async((val, next, die) => {
    UiFinder.findIn(Body.body(), '[data-mce-bogus]').fold(
      () => {
        die('Should be data-mce-bogus tags present');
      },
      () => {
        next(val);
      }
    );
  });

  const cSaveEditor = Chain.op((editor: Editor) => editor.save());

  Pipeline.async({}, [
    Logger.t('Saving inline editor should not remove data-mce-bogus tags', Chain.asStep({}, [
        McEditor.cFromHtml('<div></div>', settings),
        ApiChains.cSetRawContent('<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>'),
        cSaveEditor,
        cAssertBogusExist,
        McEditor.cRemove,
      ]),
    )
  ], function () {
    success();
  }, failure);
});
