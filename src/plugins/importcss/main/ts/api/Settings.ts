/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const shouldMergeClasses = function (editor) {
  return editor.getParam('importcss_merge_classes');
};

const shouldImportExclusive = function (editor) {
  return editor.getParam('importcss_exclusive');
};

const getSelectorConverter = function (editor) {
  return editor.getParam('importcss_selector_converter');
};

const getSelectorFilter = function (editor) {
  return editor.getParam('importcss_selector_filter');
};

const getCssGroups = function (editor) {
  return editor.getParam('importcss_groups');
};

const shouldAppend = function (editor) {
  return editor.getParam('importcss_append');
};

const getFileFilter = function (editor) {
  return editor.getParam('importcss_file_filter');
};

export default {
  shouldMergeClasses,
  shouldImportExclusive,
  getSelectorConverter,
  getSelectorFilter,
  getCssGroups,
  shouldAppend,
  getFileFilter
};