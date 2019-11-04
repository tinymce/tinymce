import { Chain, Logger, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorRemoveTest', (success, failure) => {
  Theme();

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const cAssertTextareaDisplayStyle = (expected) => Chain.op((editor: any) => {
    const textareaElement = editor.getElement();

    Assert.eq('element does not have the expected style', expected, textareaElement.style.display);
  });

  const cCreateEditor = Chain.injectThunked(() => new Editor('editor', {}, EditorManager));

  const cRemoveEditor = Chain.op((editor: any) => editor.remove());

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
    ])),

    Logger.t('init editor with no display style', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle(''),
      Chain.op((editor) => EditorManager.init({ selector: '#tinymce' })),
      cAssertTextareaDisplayStyle(''),
      McEditor.cRemove
    ])),

    Logger.t('init editor with display: none', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce" style="display: none;"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle('none'),
      Chain.op((editor) => EditorManager.init({ selector: '#tinymce' })),
      cAssertTextareaDisplayStyle('none'),
      McEditor.cRemove
    ])),

    Logger.t('init editor with display: block', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce" style="display: block;"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle('block'),
      Chain.op((editor) => EditorManager.init({ selector: '#tinymce' })),
      cAssertTextareaDisplayStyle('block'),
      McEditor.cRemove
    ]))
  ], () => {
    success();
  }, failure);
});
