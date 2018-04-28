/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const getBodySetting = (editor: Editor, name: string, defaultValue: string) => {
  const value = editor.getParam(name, defaultValue);

  if (value.indexOf('=') !== -1) {
    const bodyObj = editor.getParam(name, '', 'hash');
    return bodyObj.hasOwnProperty(editor.id) ? bodyObj[editor.id] : defaultValue;
  } else {
    return value;
  }
};

const getIframeAttrs = (editor: Editor): Record<string, string> => {
  return editor.getParam('iframe_attrs', {});
};

const getDocType = (editor: Editor): string => {
  return editor.getParam('doctype', '<!DOCTYPE html>');
};

const getDocumentBaseUrl = (editor: Editor): string => {
  return editor.getParam('document_base_url', '');
};

const getBodyId = (editor: Editor): string => {
  return getBodySetting(editor, 'body_id', 'tinymce');
};

const getBodyClass = (editor: Editor): string => {
  return getBodySetting(editor, 'body_class', '');
};

const getContentSecurityPolicy = (editor: Editor): string => {
  return editor.getParam('content_security_policy', '');
};

const shouldPutBrInPre = (editor: Editor): boolean => {
  return editor.getParam('br_in_pre', true);
};

const getForcedRootBlock = (editor: Editor): string => {
  // Legacy option
  if (editor.getParam('force_p_newlines', false)) {
    return 'p';
  }

  const block = editor.getParam('forced_root_block', 'p');
  return block === false ? '' : block;
};

const getForcedRootBlockAttrs = (editor: Editor): Record<string, string> => {
  return editor.getParam('forced_root_block_attrs', {});
};

const getBrNewLineSelector = (editor: Editor): string => {
  return editor.getParam('br_newline_selector', '.mce-toc h2,figcaption,caption');
};

const getNoNewLineSelector = (editor: Editor): string => {
  return editor.getParam('no_newline_selector', '');
};

const shouldKeepStyles = (editor: Editor): boolean => {
  return editor.getParam('keep_styles', true);
};

const shouldEndContainerOnEmptyBlock = (editor: Editor): boolean => {
  return editor.getParam('end_container_on_empty_block', false);
};

const getFontStyleValues = (editor: Editor): string[] => Tools.explode(editor.getParam('font_size_style_values', ''));
const getFontSizeClasses = (editor: Editor): string[] => Tools.explode(editor.getParam('font_size_classes', ''));

export default {
  getIframeAttrs,
  getDocType,
  getDocumentBaseUrl,
  getBodyId,
  getBodyClass,
  getContentSecurityPolicy,
  shouldPutBrInPre,
  getForcedRootBlock,
  getForcedRootBlockAttrs,
  getBrNewLineSelector,
  getNoNewLineSelector,
  shouldKeepStyles,
  shouldEndContainerOnEmptyBlock,
  getFontStyleValues,
  getFontSizeClasses
};