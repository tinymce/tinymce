/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Strings, Type } from '@ephox/katamari';
import DOMUtils from './dom/DOMUtils';
import Editor from './Editor';
import { EditorSettings, ReferrerPolicy } from './SettingsTypes';
import I18n from './util/I18n';
import Tools from './util/Tools';

const DOM = DOMUtils.DOM;

const defaultPreviewStyles = 'font-family font-size font-weight font-style text-decoration text-transform color background-color border border-radius outline text-shadow';

const getSetting = <K extends keyof EditorSettings>(name: K, defaultValue?: EditorSettings[K], type?: string) => (editor: Editor): EditorSettings[K] =>
  editor.getParam(name, defaultValue, type);

const getBodySetting = (name: string, defaultValue: string) => (editor: Editor) => {
  const value = editor.getParam(name, defaultValue);

  if (value.indexOf('=') !== -1) {
    const bodyObj = editor.getParam(name, '', 'hash');
    return bodyObj.hasOwnProperty(editor.id) ? bodyObj[editor.id] : defaultValue;
  } else {
    return value;
  }
};

const getIframeAttrs = getSetting('iframe_attrs', {});

const getDocType = getSetting('doctype', '<!DOCTYPE html>');

const getDocumentBaseUrl = getSetting('document_base_url', '');

const getBodyId = getBodySetting('body_id', 'tinymce');

const getBodyClass = getBodySetting( 'body_class', '');

const getContentSecurityPolicy = getSetting('content_security_policy', '');

const shouldPutBrInPre = getSetting('br_in_pre', true);

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

const getForcedRootBlockAttrs = getSetting('forced_root_block_attrs', {});

const getBrNewLineSelector = getSetting('br_newline_selector', '.mce-toc h2,figcaption,caption');

const getNoNewLineSelector = getSetting('no_newline_selector', '');

const shouldKeepStyles = getSetting('keep_styles', true);

const shouldEndContainerOnEmptyBlock = getSetting('end_container_on_empty_block', false);

const getFontStyleValues = Fun.compose1(Tools.explode, getSetting('font_size_style_values', 'xx-small,x-small,small,medium,large,x-large,xx-large'));

const getFontSizeClasses = Fun.compose1(Tools.explode, getSetting('font_size_classes', ''));

const getImagesDataImgFilter = getSetting('images_dataimg_filter', Fun.always, 'function');

const isAutomaticUploadsEnabled = getSetting('automatic_uploads', true, 'boolean');

const shouldReuseFileName = getSetting('images_reuse_filename', false, 'boolean');

const shouldReplaceBlobUris = getSetting('images_replace_blob_uris', true, 'boolean');

const getIconPackName = getSetting('icons', '', 'string');

const getIconsUrl = getSetting('icons_url', '', 'string');

const getImageUploadUrl = getSetting('images_upload_url', '', 'string');

const getImageUploadBasePath = getSetting('images_upload_base_path', '', 'string');

const getImagesUploadCredentials = getSetting('images_upload_credentials', false, 'boolean');

const getImagesUploadHandler = getSetting('images_upload_handler', null, 'function');

const shouldUseContentCssCors = getSetting('content_css_cors', false, 'boolean');

const getReferrerPolicy = getSetting('referrer_policy', '', 'string') as (editor: Editor) => ReferrerPolicy;

const getLanguageCode = getSetting('language', 'en', 'string');

const getLanguageUrl = getSetting('language_url', '', 'string');

const shouldIndentUseMargin = getSetting('indent_use_margin', false);

const getIndentation = getSetting('indentation', '40px', 'string');

const getContentCss = (editor: Editor): string[] => {
  const contentCss = editor.getParam('content_css');

  if (Type.isString(contentCss)) {
    return Arr.map(contentCss.split(','), Strings.trim);
  } else if (Type.isArray(contentCss)) {
    return contentCss;
  } else if (contentCss === false || editor.inline) {
    return [];
  } else {
    return [ 'default' ];
  }
};

const getDirectionality = (editor: Editor) => editor.getParam('directionality', I18n.isRtl() ? 'rtl' : undefined);

const getInlineBoundarySelector = getSetting('inline_boundaries_selector', 'a[href],code,.mce-annotation', 'string');

const getObjectResizing = getSetting('object_resizing');

const getResizeImgProportional = getSetting('resize_img_proportional', true, 'boolean');

const getPlaceholder = (editor: Editor): string =>
  // Fallback to the original elements placeholder if not set in the settings
  editor.getParam('placeholder', DOM.getAttrib(editor.getElement(), 'placeholder'), 'string');

const getEventRoot = getSetting('event_root');

const getServiceMessage = getSetting('service_message');

const getTheme = getSetting('theme');

const shouldValidate = getSetting('validate');

const isInlineBoundariesEnabled = (editor: Editor): boolean => editor.getParam('inline_boundaries') !== false;

const getFormats = getSetting('formats');

const getPreviewStyles = (editor: Editor): string => {
  const style = editor.getParam('preview_styles', defaultPreviewStyles);

  if (Type.isString(style)) {
    return style;
  } else {
    return '';
  }
};

const getCustomUiSelector = getSetting('custom_ui_selector', '', 'string');

const getThemeUrl = getSetting('theme_url');

const isInline = getSetting('inline');

const hasHiddenInput = getSetting('hidden_input');

const shouldPatchSubmit = getSetting('submit_patch');

const isEncodingXml = (editor: Editor): boolean => editor.getParam('encoding') === 'xml';

const shouldAddFormSubmitTrigger = getSetting('add_form_submit_trigger');

const shouldAddUnloadTrigger = getSetting('add_unload_trigger');

const hasForcedRootBlock = (editor: Editor): boolean => getForcedRootBlock(editor) !== '';

const getCustomUndoRedoLevels = getSetting('custom_undo_redo_levels', 0, 'number');

const shouldDisableNodeChange = getSetting('disable_nodechange');

const isReadOnly = getSetting('readonly');

const hasContentCssCors = getSetting('content_css_cors');

const getPlugins = getSetting('plugins', '', 'string');

const getExternalPlugins = getSetting('external_plugins');

const shouldBlockUnsupportedDrop = getSetting('block_unsupported_drop', true, 'boolean');

export {
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
  getPlaceholder,
  getEventRoot,
  getServiceMessage,
  getTheme,
  shouldValidate,
  isInlineBoundariesEnabled,
  getFormats,
  getPreviewStyles,
  getCustomUiSelector,
  getThemeUrl,
  isInline,
  hasHiddenInput,
  shouldPatchSubmit,
  isEncodingXml,
  shouldAddFormSubmitTrigger,
  shouldAddUnloadTrigger,
  hasForcedRootBlock,
  getCustomUndoRedoLevels,
  shouldDisableNodeChange,
  isReadOnly,
  hasContentCssCors,
  getPlugins,
  getExternalPlugins,
  shouldBlockUnsupportedDrop
};
