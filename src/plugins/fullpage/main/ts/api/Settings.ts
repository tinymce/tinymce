/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const shouldHideInSourceView = function (editor) {
  return editor.getParam('fullpage_hide_in_source_view');
};

const getDefaultXmlPi = function (editor) {
  return editor.getParam('fullpage_default_xml_pi');
};

const getDefaultEncoding = function (editor) {
  return editor.getParam('fullpage_default_encoding');
};

const getDefaultFontFamily = function (editor) {
  return editor.getParam('fullpage_default_font_family');
};

const getDefaultFontSize = function (editor) {
  return editor.getParam('fullpage_default_font_size');
};

const getDefaultTextColor = function (editor) {
  return editor.getParam('fullpage_default_text_color');
};

const getDefaultTitle = function (editor) {
  return editor.getParam('fullpage_default_title');
};

const getDefaultDocType = function (editor) {
  return editor.getParam('fullpage_default_doctype', '<!DOCTYPE html>');
};

export default {
  shouldHideInSourceView,
  getDefaultXmlPi,
  getDefaultEncoding,
  getDefaultFontFamily,
  getDefaultFontSize,
  getDefaultTextColor,
  getDefaultTitle,
  getDefaultDocType
};