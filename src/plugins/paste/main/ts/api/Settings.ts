/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const shouldPlainTextInform = function (editor) {
  return editor.getParam('paste_plaintext_inform', true);
};

const shouldBlockDrop = function (editor) {
  return editor.getParam('paste_block_drop', false);
};

const shouldPasteDataImages = function (editor) {
  return editor.getParam('paste_data_images', false);
};

const shouldFilterDrop = function (editor) {
  return editor.getParam('paste_filter_drop', true);
};

const getPreProcess = function (editor) {
  return editor.getParam('paste_preprocess');
};

const getPostProcess = function (editor) {
  return editor.getParam('paste_postprocess');
};

const getWebkitStyles = function (editor) {
  return editor.getParam('paste_webkit_styles');
};

const shouldRemoveWebKitStyles = function (editor) {
  return editor.getParam('paste_remove_styles_if_webkit', true);
};

const shouldMergeFormats = function (editor) {
  return editor.getParam('paste_merge_formats', true);
};

const isSmartPasteEnabled = function (editor) {
  return editor.getParam('smart_paste', true);
};

const isPasteAsTextEnabled = function (editor) {
  return editor.getParam('paste_as_text', false);
};

const getRetainStyleProps = function (editor) {
  return editor.getParam('paste_retain_style_properties');
};

const getWordValidElements = function (editor) {
  const defaultValidElements = (
    '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,' +
    '-p/div,-a[href|name],sub,sup,strike,br,del,table[width],tr,' +
    'td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody'
  );

  return editor.getParam('paste_word_valid_elements', defaultValidElements);
};

const shouldConvertWordFakeLists = function (editor) {
  return editor.getParam('paste_convert_word_fake_lists', true);
};

const shouldUseDefaultFilters = function (editor) {
  return editor.getParam('paste_enable_default_filters', true);
};

export default {
  shouldPlainTextInform,
  shouldBlockDrop,
  shouldPasteDataImages,
  shouldFilterDrop,
  getPreProcess,
  getPostProcess,
  getWebkitStyles,
  shouldRemoveWebKitStyles,
  shouldMergeFormats,
  isSmartPasteEnabled,
  isPasteAsTextEnabled,
  getRetainStyleProps,
  getWordValidElements,
  shouldConvertWordFakeLists,
  shouldUseDefaultFilters
};