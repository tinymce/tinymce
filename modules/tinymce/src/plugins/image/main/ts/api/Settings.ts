/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const hasDimensions = (editor: Editor) => {
  return editor.getParam('image_dimensions', true, 'boolean');
};

const hasAdvTab = (editor: Editor) => {
  return editor.getParam('image_advtab', false, 'boolean');
};

const hasUploadTab = (editor: Editor) => {
  return editor.getParam('image_uploadtab', true, 'boolean');
};

const getPrependUrl = (editor: Editor) => {
  return editor.getParam('image_prepend_url', '', 'string');
};

const getClassList = (editor: Editor) => {
  return editor.getParam('image_class_list');
};

const hasDescription = (editor: Editor) => {
  return editor.getParam('image_description', true, 'boolean');
};

const hasImageTitle = (editor: Editor) => {
  return editor.getParam('image_title', false, 'boolean');
};

const hasImageCaption = (editor: Editor) => {
  return editor.getParam('image_caption', false, 'boolean');
};

const getImageList = (editor: Editor) => {
  return editor.getParam('image_list', false);
};

const hasUploadUrl = (editor: Editor) => {
  return !!getUploadUrl(editor);
};

const hasUploadHandler = (editor: Editor) => {
  return !!getUploadHandler(editor);
};

const getUploadUrl = (editor: Editor) => {
  return editor.getParam('images_upload_url', '', 'string');
};

const getUploadHandler = (editor: Editor) => {
  return editor.getParam('images_upload_handler', undefined, 'function');
};

const getUploadBasePath = (editor: Editor) => {
  return editor.getParam('images_upload_base_path', undefined, 'string');
};

const getUploadCredentials = (editor: Editor) => {
  return editor.getParam('images_upload_credentials', false, 'boolean');
};

const showAccessibilityOptions = (editor: Editor) => {
  return editor.getParam('a11y_advanced_options', false, 'boolean');
};

const isAutomaticUploadsEnabled = (editor: Editor): boolean => {
  return editor.getParam('automatic_uploads', true, 'boolean');
};

export default {
  hasDimensions,
  hasUploadTab,
  hasAdvTab,
  getPrependUrl,
  getClassList,
  hasDescription,
  hasImageTitle,
  hasImageCaption,
  getImageList,
  hasUploadUrl,
  hasUploadHandler,
  getUploadUrl,
  getUploadHandler,
  getUploadBasePath,
  getUploadCredentials,
  showAccessibilityOptions,
  isAutomaticUploadsEnabled
};
