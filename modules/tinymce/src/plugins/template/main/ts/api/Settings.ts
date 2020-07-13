/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { ExternalTemplate } from '../ui/Dialog';

type TemplateCallback = (callback: (template: ExternalTemplate[]) => void) => void;

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getCreationDateClasses = getSetting('template_cdate_classes', 'cdate');

const getModificationDateClasses = getSetting('template_mdate_classes', 'mdate');

const getSelectedContentClasses = getSetting('template_selected_content_classes', 'selcontent');

const getPreviewReplaceValues = getSetting<Record<string, any>>('template_preview_replace_values');

const getTemplateReplaceValues = getSetting<Record<string, any>>('template_replace_values');

const getTemplates = getSetting<TemplateCallback | string | ExternalTemplate[]>('templates');

const getCdateFormat = getSetting('template_cdate_format', '%Y-%m-%d');

const getMdateFormat = getSetting('template_mdate_format', '%Y-%m-%d');

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
