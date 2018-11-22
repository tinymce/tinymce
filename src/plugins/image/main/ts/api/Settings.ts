/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const hasDimensions = function (editor) {
  return editor.settings.image_dimensions === false ? false : true;
};

const hasAdvTab = function (editor) {
  return editor.settings.image_advtab === true ? true : false;
};

const getPrependUrl = function (editor) {
  return editor.getParam('image_prepend_url', '');
};

const getClassList = function (editor) {
  return editor.getParam('image_class_list');
};

const hasDescription = function (editor) {
  return editor.settings.image_description === false ? false : true;
};

const hasImageTitle = function (editor) {
  return editor.settings.image_title === true ? true : false;
};

const hasImageCaption = function (editor) {
  return editor.settings.image_caption === true ? true : false;
};

const getImageList = function (editor) {
  return editor.getParam('image_list', false);
};

const hasUploadUrl = function (editor) {
  return editor.getParam('images_upload_url', false);
};

const hasUploadHandler = function (editor) {
  return editor.getParam('images_upload_handler', false);
};

const getUploadUrl = function (editor) {
  return editor.getParam('images_upload_url');
};

const getUploadHandler = function (editor) {
  return editor.getParam('images_upload_handler');
};

const getUploadBasePath = function (editor) {
  return editor.getParam('images_upload_base_path');
};

const getUploadCredentials = function (editor) {
  return editor.getParam('images_upload_credentials');
};

export default {
  hasDimensions,
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
  getUploadCredentials
};