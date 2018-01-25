/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

// tslint:disable:no-console

import DomQuery from 'tinymce/core/api/dom/DomQuery';

declare let tinymce: any;

const $ = DomQuery;
const imgSrc = '../img/dogleft.jpg';

$(
  '<textarea class="tinymce">' +
  '<p>' +
  '<img src="' + imgSrc + '" width="160" height="100">' +
  '<img src="' + imgSrc + '" style="width: 160px; height: 100px">' +
  '<img src="' + imgSrc + '" style="width: 20%">' +
  '<img src="' + imgSrc + '">' +
  '<img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png">' +
  '</p>' +
  '</textarea>',
).appendTo('#ephox-ui');

tinymce.init({
  // imagetools_cors_hosts: ["moxiecode.cachefly.net"],
  // imagetools_proxy: "proxy.php",
  // imagetools_api_key: '123',
  // api_key: '123',

  // images_upload_url: 'postAcceptor.php',
  // images_upload_base_path: 'base/path',
  // images_upload_credentials: true,

  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'imagetools code',
  add_unload_trigger: false,
  automatic_uploads: false,
  // images_replace_blob_uris: false,
  images_reuse_filename: true,
  paste_data_images: true,
  image_caption: true,
  height: 600,
  // rtl_ui: true,
  toolbar1: 'undo redo | styleselect | alignleft aligncenter alignright alignjustify | link image | media | emoticons',
  images_upload_handler(data, success, failure, progress) {
    console.log('blob upload [started]', 'id:', data.id(), 'filename:', data.filename());
    progress(0);

    setTimeout(function () {
      console.log('blob upload [ended]', data.id());
      success(data.id() + '.png');
      progress(100);
    }, 1000);
  },
});

function send() {
  tinymce.activeEditor.uploadImages(function () {
    console.log('saving:', tinymce.activeEditor.getContent());
  });
}

function upload() {
  console.log('upload [started]');

  tinymce.activeEditor.uploadImages(function (success) {
    console.log('upload [ended]', success);
  });
}

function dump() {
  const content = tinymce.activeEditor.getContent();

  $('#view').html(content);
  console.log(content);
}

$('<button>send()</button>').appendTo('#ephox-ui').on('click', send);
$('<button>upload()</button>').appendTo('#ephox-ui').on('click', upload);
$('<button>dump()</button>').appendTo('#ephox-ui').on('click', dump);

export {};