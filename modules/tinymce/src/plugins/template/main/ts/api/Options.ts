import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { ExternalTemplate, TemplateValues } from '../core/Types';

type TemplateCallback = (callback: (templates: ExternalTemplate[]) => void) => void;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('template_cdate_classes', {
    processor: 'string',
    default: 'cdate'
  });

  registerOption('template_mdate_classes', {
    processor: 'string',
    default: 'mdate'
  });

  registerOption('template_selected_content_classes', {
    processor: 'string',
    default: 'selcontent'
  });

  registerOption('template_preview_replace_values', {
    processor: 'object'
  });

  registerOption('template_replace_values', {
    processor: 'object'
  });

  registerOption('templates', {
    processor: (value) => Type.isString(value) || Type.isArrayOf(value, Type.isObject) || Type.isFunction(value),
    default: []
  });

  registerOption('template_cdate_format', {
    processor: 'string',
    default: editor.translate('%Y-%m-%d')
  });

  registerOption('template_mdate_format', {
    processor: 'string',
    default: editor.translate('%Y-%m-%d')
  });
};

const getCreationDateClasses = option<string>('template_cdate_classes');
const getModificationDateClasses = option<string>('template_mdate_classes');
const getSelectedContentClasses = option<string>('template_selected_content_classes');
const getPreviewReplaceValues = option<TemplateValues | undefined>('template_preview_replace_values');
const getTemplateReplaceValues = option<TemplateValues | undefined>('template_replace_values');
const getTemplates = option<string | ExternalTemplate[] | TemplateCallback>('templates');
const getCdateFormat = option<string>('template_cdate_format');
const getMdateFormat = option<string>('template_mdate_format');
const getContentStyle = option('content_style');
const shouldUseContentCssCors = option('content_css_cors');
const getBodyClass = option('body_class');

export {
  register,
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
