/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const hasDimensions = (editor: Editor) => editor.getParam('image_dimensions', true, 'boolean');

const hasAdvTab = (editor: Editor) => editor.getParam('image_advtab', false, 'boolean');

const hasUploadTab = (editor: Editor) => editor.getParam('image_uploadtab', true, 'boolean');

const getPrependUrl = (editor: Editor) => editor.getParam('image_prepend_url', '', 'string');

const getClassList = (editor: Editor) => editor.getParam('image_class_list');

const hasDescription = (editor: Editor) => editor.getParam('image_description', true, 'boolean');

const hasImageTitle = (editor: Editor) => editor.getParam('image_title', false, 'boolean');

const hasImageCaption = (editor: Editor) => editor.getParam('image_caption', false, 'boolean');

const getImageList = (editor: Editor) => editor.getParam('image_list', false);

const hasUploadUrl = (editor: Editor) => !!getUploadUrl(editor);

const hasUploadHandler = (editor: Editor) => !!getUploadHandler(editor);

const getUploadUrl = (editor: Editor) => editor.getParam('images_upload_url', '', 'string');

const getUploadHandler = (editor: Editor) => editor.getParam('images_upload_handler', undefined, 'function');

const getUploadBasePath = (editor: Editor) => editor.getParam('images_upload_base_path', undefined, 'string');

const getUploadCredentials = (editor: Editor) => editor.getParam('images_upload_credentials', false, 'boolean');

const showAccessibilityOptions = (editor: Editor) => editor.getParam('a11y_advanced_options', false, 'boolean');

const isAutomaticUploadsEnabled = (editor: Editor): boolean => editor.getParam('automatic_uploads', true, 'boolean');

export {
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
