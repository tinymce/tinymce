/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.api.Settings',
  [
  ],
  function () {
    var getBodySetting = function (editor, name, defaultValue) {
      var value = editor.getParam(name, defaultValue);

      if (value.indexOf('=') !== -1) {
        var bodyObj = editor.getParam(name, '', 'hash');
        return bodyObj.hasOwnProperty(editor.id) ? bodyObj[editor.id] : defaultValue;
      } else {
        return value;
      }
    };

    var getIframeAttrs = function (editor) {
      return editor.getParam('iframe_attrs', {});
    };

    var getDocType = function (editor) {
      return editor.getParam('doctype', '<!DOCTYPE html>');
    };

    var getDocumentBaseUrl = function (editor) {
      return editor.getParam('document_base_url', '');
    };

    var getBodyId = function (editor) {
      return getBodySetting(editor, 'body_id', 'tinymce');
    };

    var getBodyClass = function (editor) {
      return getBodySetting(editor, 'body_class', '');
    };

    var getContentSecurityPolicy = function (editor) {
      return editor.getParam('content_security_policy', '');
    };

    var shouldPutBrInPre = function (editor) {
      return editor.getParam('br_in_pre', true);
    };

    var getForcedRootBlock = function (editor) {
      // Legacy option
      if (editor.getParam('force_p_newlines', false)) {
        return 'p';
      }

      var block = editor.getParam('forced_root_block', 'p');
      return block === false ? '' : block;
    };

    var getForcedRootBlockAttrs = function (editor) {
      return editor.getParam('forced_root_block_attrs', {});
    };

    var getBrNewLineSelector = function (editor) {
      return editor.getParam('br_newline_selector', '.mce-toc h2,figcaption,caption');
    };

    var getNoNewLineSelector = function (editor) {
      return editor.getParam('no_newline_selector', '');
    };

    var shouldKeepStyles = function (editor) {
      return editor.getParam('keep_styles', true);
    };

    var shouldEndContainerOnEmtpyBlock = function (editor) {
      return editor.getParam('end_container_on_empty_block', false);
    };

    return {
      getIframeAttrs: getIframeAttrs,
      getDocType: getDocType,
      getDocumentBaseUrl: getDocumentBaseUrl,
      getBodyId: getBodyId,
      getBodyClass: getBodyClass,
      getContentSecurityPolicy: getContentSecurityPolicy,
      shouldPutBrInPre: shouldPutBrInPre,
      getForcedRootBlock: getForcedRootBlock,
      getForcedRootBlockAttrs: getForcedRootBlockAttrs,
      getBrNewLineSelector: getBrNewLineSelector,
      getNoNewLineSelector: getNoNewLineSelector,
      shouldKeepStyles: shouldKeepStyles,
      shouldEndContainerOnEmtpyBlock: shouldEndContainerOnEmtpyBlock
    };
  }
);
