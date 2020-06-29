/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getCreationDateClasses = (editor: Editor) => editor.getParam('template_cdate_classes', 'cdate');

const getModificationDateClasses = (editor: Editor) => editor.getParam('template_mdate_classes', 'mdate');

const getSelectedContentClasses = (editor: Editor) => editor.getParam('template_selected_content_classes', 'selcontent');

const getPreviewReplaceValues = (editor: Editor) => editor.getParam('template_preview_replace_values');

const getTemplateReplaceValues = (editor: Editor) => editor.getParam('template_replace_values');

const getTemplates = (editor: Editor) => editor.getParam('templates');

const getCdateFormat = (editor: Editor) => editor.getParam('template_cdate_format', editor.translate('%Y-%m-%d'));

const getMdateFormat = (editor: Editor) => editor.getParam('template_mdate_format', editor.translate('%Y-%m-%d'));

const getBodyClassFromHash = (editor: Editor) => {
  const bodyClass = editor.getParam('body_class', '', 'hash');
  return bodyClass[editor.id] || '';
};

const getBodyClass = (editor: Editor) => {
  const bodyClass = editor.getParam('body_class', '', 'string');

  if (bodyClass.indexOf('=') === -1) {
    return bodyClass;
  } else {
    return getBodyClassFromHash(editor);
  }
};

export {
  getCreationDateClasses,
  getModificationDateClasses,
  getSelectedContentClasses,
  getPreviewReplaceValues,
  getTemplateReplaceValues,
  getTemplates,
  getCdateFormat,
  getMdateFormat,
  getBodyClass
};
