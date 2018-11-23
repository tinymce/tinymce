/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

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

const getCdateFormat = function (editor) {
  return editor.getParam('template_cdate_format', editor.getLang('template.cdate_format'));
};

const getMdateFormat = function (editor) {
  return editor.getParam('template_mdate_format', editor.getLang('template.mdate_format'));
};

const getDialogWidth = function (editor) {
  return editor.getParam('template_popup_width', 600);
};

const getDialogHeight = function (editor) {
  return Math.min(DOMUtils.DOM.getViewPort().h, editor.getParam('template_popup_height', 500));
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
  getDialogWidth,
  getDialogHeight
};