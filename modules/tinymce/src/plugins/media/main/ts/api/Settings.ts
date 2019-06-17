/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getScripts = function (editor) {
  return editor.getParam('media_scripts');
};

const getAudioTemplateCallback = function (editor) {
  return editor.getParam('audio_template_callback');
};

const getVideoTemplateCallback = function (editor) {
  return editor.getParam('video_template_callback');
};

const hasLiveEmbeds = function (editor) {
  return editor.getParam('media_live_embeds', true);
};

const shouldFilterHtml = function (editor) {
  return editor.getParam('media_filter_html', true);
};

const getUrlResolver = function (editor) {
  return editor.getParam('media_url_resolver');
};

const hasAltSource = function (editor) {
  return editor.getParam('media_alt_source', true);
};

const hasPoster = function (editor) {
  return editor.getParam('media_poster', true);
};

const hasDimensions = function (editor) {
  return editor.getParam('media_dimensions', true);
};

export default {
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