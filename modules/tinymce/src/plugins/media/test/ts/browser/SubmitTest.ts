import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { DataToHtmlCallback } from 'tinymce/plugins/media/core/DataToHtml';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.core.SubmitTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const mediaUrlResolver = (data: { url: string }, resolve: (data: { html: string }) => void) => {
    setTimeout(() => {
      resolve({
        html: '<span id="fake">' + data.url + '</span>'
      });
    }, 500);
  };

  const customEmbed =
  '<div style="left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.338%; max-width: 650px;">' +
  '<iframe src="https://www.youtube.com/embed/IcgmSRJHu_8"' +
  ' width="560" height="314" allowfullscreen="allowfullscreen">' +
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

  const pTestTemplateCallbackContentSubmit = async (editor: Editor, templateOption: string, templateCallback: DataToHtmlCallback, url: string, expected: string) => {
    editor.options.set(templateOption, templateCallback);
    await Utils.pOpenDialog(editor);
    await Utils.pPasteSourceValue(editor, url);
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, expected);
    editor.options.unset(templateOption);
  };

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: Open dialog, set url, submit dialog and assert content', async () => {
    const editor = hook.editor();
    editor.options.set('media_url_resolver', mediaUrlResolver);
    await pTestResolvedEmbedContentSubmit(editor,
      'https://www.youtube.com/watch?v=IcgmSRJHu_8',
      '<p><span id="fake">https://www.youtube.com/watch?v=IcgmSRJHu_8</span></p>'
    );
  });

  it('TBA: Remove media_url_resolver setting and assert changed content', async () => {
    const editor = hook.editor();
    editor.options.unset('media_url_resolver');
    await pTestResolvedEmbedContentSubmit(editor,
      'https://www.youtube.com/watch?v=IcgmSRJHu_8',
      '<p><iframe src="https://www.youtube.com/embed/IcgmSRJHu_8" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>'
    );
  });

  it('TBA: Open dialog, set embed content, submit dialog and assert content', async () => {
    const editor = hook.editor();
    editor.options.set('media_url_resolver', mediaUrlResolver);
    await pTestManualEmbedContentSubmit(editor, customEmbed, customEmbed);
    editor.options.unset('media_url_resolver');
    await pTestEmbedUnchangedAfterOpenCloseDialog(editor, customEmbed);
  });

  it('TBA: Set audio_template_callback and embed content, submit dialog and assert content', async () => {
    // Audio should be any mp3 link to trigger callback
    const editor = hook.editor();
    const audioTemplateCallback = Fun.constant('<audio id="template" controls="controls"><source src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"></audio>');
    const expected = '<p><audio id="template" controls="controls"><source src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"></audio></p>';
    await pTestTemplateCallbackContentSubmit(editor, 'audio_template_callback', audioTemplateCallback, 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', expected);
    await pTestEmbedUnchangedAfterOpenCloseDialog(editor, expected);
  });

  it('TBA: Set video_template_callback and embed content, submit dialog and assert content', async () => {
    // Video should be any mp4 link to trigger callback
    const editor = hook.editor();
    const videoTemplateCallback = Fun.constant('<video id="template" controls="controls" width="500" height="300" ><source src="https://i.imgur.com/Tu4e5WX.mp4"></video>');
    const expected = '<p><video id="template" controls="controls" width="500" height="300"><source src="https://i.imgur.com/Tu4e5WX.mp4"></video></p>';
    await pTestTemplateCallbackContentSubmit(editor, 'video_template_callback', videoTemplateCallback, 'https://i.imgur.com/Tu4e5WX.mp4', expected);
    await pTestEmbedUnchangedAfterOpenCloseDialog(editor, expected);
  });

  it('TINY-8684: Set iframe_template_callback and embed content, submit dialog and assert content', async () => {
    // Any youtube link triggers iframe callback
    const editor = hook.editor();
    const iframeTemplateCallback = Fun.constant('<iframe id="template" title="testcallback" src="https://www.youtube.com/embed/IcgmSRJHu_8" width="500" height="300"></iframe>');
    const expected = '<p><iframe id="template" title="testcallback" src="https://www.youtube.com/embed/IcgmSRJHu_8" width="500" height="300"></iframe></p>';
    await pTestTemplateCallbackContentSubmit(editor, 'iframe_template_callback', iframeTemplateCallback, 'https://www.youtube.com/embed/IcgmSRJHu_8', expected);
    await pTestEmbedUnchangedAfterOpenCloseDialog(editor, expected);
  });
});
