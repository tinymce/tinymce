/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const shouldHideInSourceView = getSetting<boolean>('fullpage_hide_in_source_view');

const getDefaultXmlPi = getSetting<boolean>('fullpage_default_xml_pi');

const getDefaultEncoding = getSetting<string>('fullpage_default_encoding');

const getDefaultFontFamily = getSetting<string>('fullpage_default_font_family');

const getDefaultFontSize = getSetting<string>('fullpage_default_font_size');

const getDefaultTextColor = getSetting<string>('fullpage_default_text_color');

const getDefaultTitle = getSetting<string>('fullpage_default_title');

const getDefaultDocType = getSetting<string>('fullpage_default_doctype', '<!DOCTYPE html>');

const getProtect = getSetting<boolean>('protect');

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
