import { Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McEditor } from '@ephox/mcagar';

import { Editor } from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorRemoveTest', (success, failure) => {
  Theme();

  const settings = {
    skin_url: '/project/js/tinymce/skins/lightgray'
  };

  const cCreateEditor = Chain.on((_, next, die) => next(Chain.wrap(new Editor('editor', {}, EditorManager))));

  const cRemoveEditor = Chain.op((editor) => editor.remove());

  Pipeline.async({}, [
    Logger.t('remove editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cRemoveEditor,
    ])),

    Logger.t('remove editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      Chain.mapper((value) => {
        const body = value.getBody();
        body.parentNode.removeChild(body);
        return value;
      }),
      McEditor.cRemove
    ]))
  ], () => {
    success();
  }, failure);
});
