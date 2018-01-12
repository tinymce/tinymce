/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getBodySetting = function (editor, name, defaultValue) {
  const value = editor.getParam(name, defaultValue);

  if (value.indexOf('=') !== -1) {
    const bodyObj = editor.getParam(name, '', 'hash');
    return bodyObj.hasOwnProperty(editor.id) ? bodyObj[editor.id] : defaultValue;
  } else {
    return value;
  }
};

const getIframeAttrs = function (editor) {
  return editor.getParam('iframe_attrs', {});
};

const getDocType = function (editor) {
  return editor.getParam('doctype', '<!DOCTYPE html>');
};

const getDocumentBaseUrl = function (editor) {
  return editor.getParam('document_base_url', '');
};

const getBodyId = function (editor) {
  return getBodySetting(editor, 'body_id', 'tinymce');
};

const getBodyClass = function (editor) {
  return getBodySetting(editor, 'body_class', '');
};

const getContentSecurityPolicy = function (editor) {
  return editor.getParam('content_security_policy', '');
};

const shouldPutBrInPre = function (editor) {
  return editor.getParam('br_in_pre', true);
};

const getForcedRootBlock = function (editor) {
  // Legacy option
  if (editor.getParam('force_p_newlines', false)) {
    return 'p';
  }

  const block = editor.getParam('forced_root_block', 'p');
  return block === false ? '' : block;
};

const getForcedRootBlockAttrs = function (editor) {
  return editor.getParam('forced_root_block_attrs', {});
};

const getBrNewLineSelector = function (editor) {
  return editor.getParam('br_newline_selector', '.mce-toc h2,figcaption,caption');
};

const getNoNewLineSelector = function (editor) {
  return editor.getParam('no_newline_selector', '');
};

const shouldKeepStyles = function (editor) {
  return editor.getParam('keep_styles', true);
};

const shouldEndContainerOnEmtpyBlock = function (editor) {
  return editor.getParam('end_container_on_empty_block', false);
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
  shouldEndContainerOnEmtpyBlock
};