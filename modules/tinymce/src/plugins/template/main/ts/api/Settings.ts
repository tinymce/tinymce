/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { ExternalTemplate, TemplateValues } from '../core/Types';

type TemplateCallback = (callback: (templates: ExternalTemplate[]) => void) => void;

const getCreationDateClasses = (editor: Editor): string =>
  editor.getParam('template_cdate_classes', 'cdate');

const getModificationDateClasses = (editor: Editor): string =>
  editor.getParam('template_mdate_classes', 'mdate');

const getSelectedContentClasses = (editor: Editor): string =>
  editor.getParam('template_selected_content_classes', 'selcontent');

const getPreviewReplaceValues = (editor: Editor): TemplateValues | undefined =>
  editor.getParam('template_preview_replace_values');

const getContentStyle = (editor: Editor): string =>
  editor.getParam('content_style', '', 'string');

const shouldUseContentCssCors = (editor: Editor): boolean =>
  editor.getParam('content_css_cors', false, 'boolean');

const getTemplateReplaceValues = (editor: Editor): TemplateValues | undefined =>
  editor.getParam('template_replace_values');

const getTemplates = (editor: Editor): string | ExternalTemplate[] | TemplateCallback | undefined =>
  editor.getParam('templates');

const getCdateFormat = (editor: Editor): string =>
  editor.getParam('template_cdate_format', editor.translate('%Y-%m-%d'));

const getMdateFormat = (editor: Editor): string =>
  editor.getParam('template_mdate_format', editor.translate('%Y-%m-%d'));

const getBodyClassFromHash = (editor: Editor): string => {
  const bodyClass = editor.getParam('body_class', '', 'hash');
  return bodyClass[editor.id] || '';
};

const getBodyClass = (editor: Editor): string => {
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
  getBodyClass,
  getContentStyle,
  shouldUseContentCssCors
};
