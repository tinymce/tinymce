/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import { HTMLImageElement } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { UploadHandler } from 'tinymce/core/file/Uploader';

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

const getImagesDataImgFilter = (editor: Editor): (imgElm: HTMLImageElement) => boolean => {
  return editor.getParam('images_dataimg_filter', Fun.constant(true), 'function');
};

const isAutomaticUploadsEnabled = (editor: Editor): boolean => {
  return editor.getParam('automatic_uploads', true, 'boolean');
};

const shouldReuseFileName = (editor: Editor): boolean => {
  return editor.getParam('images_reuse_filename', false, 'boolean');
};

const shouldReplaceBlobUris = (editor: Editor): boolean => {
  return editor.getParam('images_replace_blob_uris', true, 'boolean');
};

const getImageUploadUrl = (editor: Editor): string => {
  return editor.getParam('images_upload_url', '', 'string');
};

const getImageUploadBasePath = (editor: Editor): string => {
  return editor.getParam('images_upload_base_path', '', 'string');
};

const getImagesUploadCredentials = (editor: Editor): boolean => {
  return editor.getParam('images_upload_credentials', false, 'boolean');
};

const getImagesUploadHandler = (editor: Editor): UploadHandler => {
  return editor.getParam('images_upload_handler', null, 'function');
};

const shouldUseContentCssCors = (editor: Editor): boolean => {
  return editor.getParam('content_css_cors', false, 'boolean');
};

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
  getFontSizeClasses,
  getImagesDataImgFilter,
  isAutomaticUploadsEnabled,
  shouldReuseFileName,
  shouldReplaceBlobUris,
  getImageUploadUrl,
  getImageUploadBasePath,
  getImagesUploadCredentials,
  getImagesUploadHandler,
  shouldUseContentCssCors
};