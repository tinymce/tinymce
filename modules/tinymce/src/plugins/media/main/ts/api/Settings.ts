/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { DataToHtmlCallback } from '../core/DataToHtml';
import { MediaResolver } from '../core/Service';
import { VideoScript } from '../core/VideoScript';

const getScripts = (editor: Editor): VideoScript[] | undefined =>
  editor.getParam('media_scripts');

const getAudioTemplateCallback = (editor: Editor): DataToHtmlCallback | undefined =>
  editor.getParam('audio_template_callback');

const getVideoTemplateCallback = (editor: Editor): DataToHtmlCallback | undefined =>
  editor.getParam('video_template_callback');

const hasLiveEmbeds = (editor: Editor): boolean =>
  editor.getParam('media_live_embeds', true);

const shouldFilterHtml = (editor: Editor): boolean =>
  editor.getParam('media_filter_html', true);

const getUrlResolver = (editor: Editor): MediaResolver | undefined =>
  editor.getParam('media_url_resolver');

const hasAltSource = (editor: Editor): boolean =>
  editor.getParam('media_alt_source', true);

const hasPoster = (editor: Editor): boolean =>
  editor.getParam('media_poster', true);

const hasDimensions = (editor: Editor): boolean =>
  editor.getParam('media_dimensions', true);

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
