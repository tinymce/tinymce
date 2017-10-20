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

    return {
      getIframeAttrs: getIframeAttrs,
      getDocType: getDocType,
      getDocumentBaseUrl: getDocumentBaseUrl,
      getBodyId: getBodyId,
      getBodyClass: getBodyClass,
      getContentSecurityPolicy: getContentSecurityPolicy
    };
  }
);
