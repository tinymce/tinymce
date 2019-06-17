/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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