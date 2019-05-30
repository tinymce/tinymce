// tslint:disable:no-console

import { console } from '@ephox/dom-globals';
import Delay from 'tinymce/core/api/util/Delay';
import DomQuery from 'tinymce/core/api/dom/DomQuery';

declare let tinymce: any;

const $ = DomQuery;
const imgSrc = '../img/dogleft.jpg';

$(
  '<textarea class="tinymce">' +
  '<p><img src="' + imgSrc + '" width="160" height="100">' +
  '<p><img src="' + imgSrc + '" style="width: 160px; height: 100px">' +
  '<p><img src="' + imgSrc + '" style="width: 20%">' +
  '<p><img src="' + imgSrc + '">' +
  '<p><img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png">' +
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
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  plugins: 'image imagetools code',
  add_unload_trigger: false,
  automatic_uploads: false,
  // images_replace_blob_uris: false,
  images_reuse_filename: true,
  paste_data_images: true,
  image_caption: true,
  height: 600,
  // imagetools_cors_hosts: ['localhost', 'moxiecode.cachefly.net'],
  // imagetools_credentials_hosts: ['localhost'],
  // rtl_ui: true,
  toolbar: 'editimage undo redo | styleselect | alignleft aligncenter alignright alignjustify | link image | media | emoticons',
  images_upload_handler(data, success, failure, progress) {
    console.log('blob upload [started]', 'id:', data.id(), 'filename:', data.filename());
    progress(0);

    Delay.setTimeout(function () {
      console.log('blob upload [ended]', data.id());
      success(data.id() + '.png');
      progress(100);
    }, 1000);
  }
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