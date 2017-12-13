/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DomQuery from 'tinymce/core/dom/DomQuery';
import EditorManager from 'tinymce/core/EditorManager';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  var $ = DomQuery;
  var imgSrc = '../img/dogleft.jpg';

  CodePlugin();
  ImageToolsPlugin();
  ModernTheme();

  $(
    '<textarea class="tinymce">' +
    '<p>' +
    '<img src="' + imgSrc + '" width="160" height="100">' +
    '<img src="' + imgSrc + '" style="width: 160px; height: 100px">' +
    '<img src="' + imgSrc + '" style="width: 20%">' +
    '<img src="' + imgSrc + '">' +
    '<img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png">' +
    '</p>' +
    '</textarea>'
  ).appendTo('#ephox-ui');

  EditorManager.init({
    //imagetools_cors_hosts: ["moxiecode.cachefly.net"],
    //imagetools_proxy: "proxy.php",
    //imagetools_api_key: '123',
    //api_key: '123',

    //images_upload_url: 'postAcceptor.php',
    //images_upload_base_path: 'base/path',
    //images_upload_credentials: true,

    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "imagetools code",
    add_unload_trigger: false,
    automatic_uploads: false,
    //images_replace_blob_uris: false,
    images_reuse_filename: true,
    paste_data_images: true,
    image_caption: true,
    height: 600,
    toolbar1: "undo redo | styleselect | alignleft aligncenter alignright alignjustify | link image | media | emoticons",
    images_upload_handler: function (data, success, failure, progress) {
      console.log('blob upload [started]', 'id:', data.id(), 'filename:', data.filename());
      progress(0);

      setTimeout(function () {
        console.log('blob upload [ended]', data.id());
        success(data.id() + '.png');
        progress(100);
      }, 1000);
    }
  });

  function send() {
    EditorManager.activeEditor.uploadImages(function () {
      console.log('saving:', EditorManager.activeEditor.getContent());
    });
  }

  function upload() {
    console.log('upload [started]');

    EditorManager.activeEditor.uploadImages(function (success) {
      console.log('upload [ended]', success);
    });
  }

  function dump() {
    var content = EditorManager.activeEditor.getContent();

    $('#view').html(content);
    console.log(content);
  }

  $('<button>send()</button>').appendTo('#ephox-ui').on('click', send);
  $('<button>upload()</button>').appendTo('#ephox-ui').on('click', upload);
  $('<button>dump()</button>').appendTo('#ephox-ui').on('click', dump);
};