/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getCreationDateClasses = function (editor) {
  return editor.getParam('template_cdate_classes', 'cdate');
};

const getModificationDateClasses = function (editor) {
  return editor.getParam('template_mdate_classes', 'mdate');
};

const getSelectedContentClasses = function (editor) {
  return editor.getParam('template_selected_content_classes', 'selcontent');
};

const getPreviewReplaceValues = function (editor) {
  return editor.getParam('template_preview_replace_values');
};

const getTemplateReplaceValues = function (editor) {
  return editor.getParam('template_replace_values');
};

const getTemplates = function (editorSettings) {
  return editorSettings.templates;
};

const getCdateFormat = (editor: Editor) => {
  return editor.getParam('template_cdate_format', editor.translate('%Y-%m-%d'));
};

const getMdateFormat = (editor: Editor) => {
  return editor.getParam('template_mdate_format', editor.translate('%Y-%m-%d'));
};

export default {
  getCreationDateClasses,
  getModificationDateClasses,
  getSelectedContentClasses,
  getPreviewReplaceValues,
  getTemplateReplaceValues,
  getTemplates,
  getCdateFormat,
  getMdateFormat,
};