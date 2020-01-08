/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLImageElement } from '@ephox/dom-globals';
import { Arr, Fun, Strings, Type } from '@ephox/katamari';
import { UploadHandler } from '../file/Uploader';
import DOMUtils from './dom/DOMUtils';
import Editor from './Editor';
import { ReferrerPolicy } from './SettingsTypes';
import I18n from './util/I18n';
import Tools from './util/Tools';

const DOM = DOMUtils.DOM;

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
  if (block === false) {
    return '';
  } else if (block === true) {
    return 'p';
  } else {
    return block;
  }
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

const getFontStyleValues = (editor: Editor): string[] => Tools.explode(editor.getParam('font_size_style_values', 'xx-small,x-small,small,medium,large,x-large,xx-large'));

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

const getIconPackName = (editor: Editor) => {
  return editor.getParam('icons', '', 'string');
};

const getIconsUrl = (editor: Editor): string => {
  return editor.getParam('icons_url', '', 'string');
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

const getReferrerPolicy = (editor: Editor): ReferrerPolicy => {
  return editor.getParam('referrer_policy', '', 'string') as ReferrerPolicy;
};

const getLanguageCode = (editor: Editor): string => {
  return editor.getParam('language', 'en', 'string');
};

const getLanguageUrl = (editor: Editor): string => {
  return editor.getParam('language_url', '', 'string');
};

const shouldIndentUseMargin = (editor: Editor): boolean => {
  return editor.getParam('indent_use_margin', false);
};

const getIndentation = (editor: Editor): string => {
  return editor.getParam('indentation', '40px', 'string');
};

const getContentCss = (editor: Editor): string[] => {
  const contentCss = editor.settings.content_css;

  if (Type.isString(contentCss)) {
    return Arr.map(contentCss.split(','), Strings.trim);
  } else if (Type.isArray(contentCss)) {
    return contentCss;
  } else if (contentCss === false || editor.inline) {
    return [];
  } else {
    return ['default'];
  }
};

const getDirectionality = (editor: Editor): string | undefined => {
  return editor.getParam('directionality', I18n.isRtl() ? 'rtl' : undefined);
};

const getInlineBoundarySelector = (editor: Editor): string => {
  return editor.getParam('inline_boundaries_selector', 'a[href],code,.mce-annotation', 'string');
};

const getObjectResizing = (editor: Editor) => {
  return editor.getParam('object_resizing');
};

const getResizeImgProportional = (editor: Editor): boolean => {
  return editor.getParam('resize_img_proportional', true, 'boolean');
};

const getPlaceholder = (editor: Editor): string => {
  // Fallback to the original elements placeholder if not set in the settings
  return editor.getParam('placeholder', DOM.getAttrib(editor.getElement(), 'placeholder'), 'string');
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
  getIconPackName,
  getIconsUrl,
  getImagesDataImgFilter,
  isAutomaticUploadsEnabled,
  shouldReuseFileName,
  shouldReplaceBlobUris,
  getImageUploadUrl,
  getImageUploadBasePath,
  getImagesUploadCredentials,
  getImagesUploadHandler,
  shouldUseContentCssCors,
  getReferrerPolicy,
  getLanguageCode,
  getLanguageUrl,
  shouldIndentUseMargin,
  getIndentation,
  getContentCss,
  getDirectionality,
  getInlineBoundarySelector,
  getObjectResizing,
  getResizeImgProportional,
  getPlaceholder
};
