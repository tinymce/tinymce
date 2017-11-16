/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.image.api.Settings',
  [
  ],
  function () {
    var hasDimensions = function (editor) {
      return editor.settings.image_dimensions === false ? false : true;
    };

    var hasAdvTab = function (editor) {
      return editor.settings.image_advtab === true ? true : false;
    };

    var getPrependUrl = function (editor) {
      return editor.getParam('image_prepend_url', '');
    };

    var getClassList = function (editor) {
      return editor.getParam('image_class_list');
    };

    var hasDescription = function (editor) {
      return editor.settings.image_description === false ? false : true;
    };

    var hasImageTitle = function (editor) {
      return editor.settings.image_title === true ? true : false;
    };

    var hasImageCaption = function (editor) {
      return editor.settings.image_caption === true ? true : false;
    };

    var getImageList = function (editor) {
      return editor.getParam('image_list', false);
    };

    var hasUploadUrl = function (editor) {
      return editor.getParam('images_upload_url', false);
    };

    var hasUploadHandler = function (editor) {
      return editor.getParam('images_upload_handler', false);
    };

    var getUploadUrl = function (editor) {
      return editor.getParam('images_upload_url');
    };

    var getUploadHandler = function (editor) {
      return editor.getParam('images_upload_handler');
    };

    var getUploadBasePath = function (editor) {
      return editor.getParam('images_upload_base_path');
    };

    var getUploadCredentials = function (editor) {
      return editor.getParam('images_upload_credentials');
    };

    return {
      hasDimensions: hasDimensions,
      hasAdvTab: hasAdvTab,
      getPrependUrl: getPrependUrl,
      getClassList: getClassList,
      hasDescription: hasDescription,
      hasImageTitle: hasImageTitle,
      hasImageCaption: hasImageCaption,
      getImageList: getImageList,
      hasUploadUrl: hasUploadUrl,
      hasUploadHandler: hasUploadHandler,
      getUploadUrl: getUploadUrl,
      getUploadHandler: getUploadHandler,
      getUploadBasePath: getUploadBasePath,
      getUploadCredentials: getUploadCredentials
    };
  }
);