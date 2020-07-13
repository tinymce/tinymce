/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { DataToHtmlCallback } from '../core/DataToHtml';
import { VideoScript } from '../core/VideoScript';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getScripts = getSetting<VideoScript[]>('media_scripts');

const getAudioTemplateCallback = getSetting<DataToHtmlCallback>('audio_template_callback');

const getVideoTemplateCallback = getSetting<DataToHtmlCallback>('video_template_callback');

const hasLiveEmbeds = getSetting('media_live_embeds', true);

const shouldFilterHtml = getSetting('media_filter_html', true);

const getUrlResolver = getSetting<Function>('media_url_resolver');

const hasAltSource = getSetting('media_alt_source', true);

const hasPoster = getSetting('media_poster', true);

const hasDimensions = getSetting('media_dimensions', true);

export {
  getScripts,
  getAudioTemplateCallback,
  getVideoTemplateCallback,
  hasLiveEmbeds,
  shouldFilterHtml,
  getUrlResolver,
  hasAltSource,
  hasPoster,
  hasDimensions
};
