import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { DataToHtmlCallback } from '../core/DataToHtml';
import { MediaResolver } from '../core/Service';

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('audio_template_callback', {
    processor: 'function'
  });

  registerOption('video_template_callback', {
    processor: 'function'
  });

  registerOption('iframe_template_callback', {
    processor: 'function'
  });

  registerOption('media_live_embeds', {
    processor: 'boolean',
    default: true
  });

  registerOption('media_filter_html', {
    processor: 'boolean',
    default: true
  });

  registerOption('media_url_resolver', {
    processor: 'function'
  });

  registerOption('media_alt_source', {
    processor: 'boolean',
    default: true
  });

  registerOption('media_poster', {
    processor: 'boolean',
    default: true
  });

  registerOption('media_dimensions', {
    processor: 'boolean',
    default: true
  });
};

const getAudioTemplateCallback = option<DataToHtmlCallback | undefined>('audio_template_callback');
const getVideoTemplateCallback = option<DataToHtmlCallback | undefined>('video_template_callback');
const getIframeTemplateCallback = option<DataToHtmlCallback | undefined>('iframe_template_callback');
const hasLiveEmbeds = option<boolean>('media_live_embeds');
const shouldFilterHtml = option<boolean>('media_filter_html');
const getUrlResolver = option<MediaResolver | undefined>('media_url_resolver');
const hasAltSource = option<boolean>('media_alt_source');
const hasPoster = option<boolean>('media_poster');
const hasDimensions = option<boolean>('media_dimensions');

export {
  register,
  getAudioTemplateCallback,
  getVideoTemplateCallback,
  getIframeTemplateCallback,
  hasLiveEmbeds,
  shouldFilterHtml,
  getUrlResolver,
  hasAltSource,
  hasPoster,
  hasDimensions
};
