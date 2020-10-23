/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const shouldHideInSourceView = (editor: Editor) => editor.getParam('fullpage_hide_in_source_view');

const getDefaultXmlPi = (editor: Editor) => editor.getParam('fullpage_default_xml_pi');

const getDefaultEncoding = (editor: Editor) => editor.getParam('fullpage_default_encoding');

const getDefaultFontFamily = (editor: Editor) => editor.getParam('fullpage_default_font_family');

const getDefaultFontSize = (editor: Editor) => editor.getParam('fullpage_default_font_size');

const getDefaultTextColor = (editor: Editor) => editor.getParam('fullpage_default_text_color');

const getDefaultTitle = (editor: Editor) => editor.getParam('fullpage_default_title');

const getDefaultDocType = (editor: Editor) => editor.getParam('fullpage_default_doctype', '<!DOCTYPE html>');

const getProtect = (editor: Editor) => editor.getParam('protect');

export {
  shouldHideInSourceView,
  getDefaultXmlPi,
  getDefaultEncoding,
  getDefaultFontFamily,
  getDefaultFontSize,
  getDefaultTextColor,
  getDefaultTitle,
  getDefaultDocType,
  getProtect
};
