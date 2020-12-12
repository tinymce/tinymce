/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getScripts = (editor) => {
  return editor.getParam('media_scripts');
};

const getAudioTemplateCallback = (editor) => {
  return editor.getParam('audio_template_callback');
};

const getVideoTemplateCallback = (editor) => {
  return editor.getParam('video_template_callback');
};

const hasLiveEmbeds = (editor) => {
  return editor.getParam('media_live_embeds', true);
};

const shouldFilterHtml = (editor) => {
  return editor.getParam('media_filter_html', true);
};

const getUrlResolver = (editor) => {
  return editor.getParam('media_url_resolver');
};

const hasAltSource = (editor) => {
  return editor.getParam('media_alt_source', true);
};

const hasPoster = (editor) => {
  return editor.getParam('media_poster', true);
};

const hasDimensions = (editor) => {
  return editor.getParam('media_dimensions', true);
};

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
