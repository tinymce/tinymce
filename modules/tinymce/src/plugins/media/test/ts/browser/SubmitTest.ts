import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.core.SubmitTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const mediaUrlResolver = (data: { url: string }, resolve: (data: { html: string }) => void) => {
    Delay.setTimeout(() => {
      resolve({
        html: '<span id="fake">' + data.url + '</span>'
      });
    }, 500);
  };

  const customEmbed =
  '<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.338%; max-width: 650px;">' +
  '<iframe src="https://www.youtube.com/embed/IcgmSRJHu_8"' +
  ' width="560" height="314" allowfullscreen="allowfullscreen" data-mce-fragment="1">' +
  '</iframe></div>';

  const pTestResolvedEmbedContentSubmit = async (editor: Editor, url: string, expected: string) => {
    await Utils.pOpenDialog(editor);
    await Utils.pSetFormItemNoEvent(editor, url);
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, expected);
  };

  const pTestManualEmbedContentSubmit = async (editor: Editor, embed: string, expected: string) => {
    await Utils.pOpenDialog(editor);
    await Utils.pPasteTextareaValue(editor, embed);
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, expected);
  };

  const pTestEmbedUnchangedAfterOpenCloseDialog = async (editor: Editor, expected: string) => {
    await Utils.pOpenDialog(editor);
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, expected);
  };

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: Open dialog, set url, submit dialog and assert content', async () => {
    const editor = hook.editor();
    editor.settings.media_url_resolver = mediaUrlResolver;
    await pTestResolvedEmbedContentSubmit(editor,
      'https://www.youtube.com/watch?v=IcgmSRJHu_8',
      '<p><span id="fake">https://www.youtube.com/watch?v=IcgmSRJHu_8</span></p>'
    );
  });

  it('TBA: Remove media_url_resolver setting and assert changed content', async () => {
    const editor = hook.editor();
    delete editor.settings.media_url_resolver;
    await pTestResolvedEmbedContentSubmit(editor,
      'https://www.youtube.com/watch?v=IcgmSRJHu_8',
      '<p><iframe src="https://www.youtube.com/embed/IcgmSRJHu_8" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>'
    );
  });

  it('TBA: Open dialog, set embed content, submit dialog and assert content', async () => {
    const editor = hook.editor();
    editor.settings.media_url_resolver = mediaUrlResolver;
    await pTestManualEmbedContentSubmit(editor, customEmbed, customEmbed);
    delete editor.settings.media_url_resolver;
    await pTestEmbedUnchangedAfterOpenCloseDialog(editor, customEmbed);
  });
});
