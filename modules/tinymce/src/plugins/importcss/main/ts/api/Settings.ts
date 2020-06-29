/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const shouldMergeClasses = (editor: Editor) => editor.getParam('importcss_merge_classes');

const shouldImportExclusive = (editor: Editor) => editor.getParam('importcss_exclusive');

const getSelectorConverter = (editor: Editor) => editor.getParam('importcss_selector_converter');

const getSelectorFilter = (editor: Editor) => editor.getParam('importcss_selector_filter');

const getCssGroups = (editor: Editor) => editor.getParam('importcss_groups');

const shouldAppend = (editor: Editor) => editor.getParam('importcss_append');

const getFileFilter = (editor: Editor) => editor.getParam('importcss_file_filter');

const getSkin = (editor: Editor) => {
  const skin = editor.getParam('skin');
  return skin !== false ? skin || 'oxide' : false;
};

const getSkinUrl = (editor: Editor) => editor.getParam('skin_url');

export {
  shouldMergeClasses,
  shouldImportExclusive,
  getSelectorConverter,
  getSelectorFilter,
  getCssGroups,
  shouldAppend,
  getFileFilter,
  getSkin,
  getSkinUrl
};
