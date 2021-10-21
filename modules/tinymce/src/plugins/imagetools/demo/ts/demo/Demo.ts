/* eslint-disable no-console */
import { DomEvent, Html, Insert, InsertAll, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

declare let tinymce: any;

const imgSrc = '../img/dogleft.jpg';

const ephoxUi = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
const demo = SugarElement.fromHtml(
  '<textarea class="tinymce">' +
  '<p><img src="' + imgSrc + '" width="160" height="100">' +
  '<p><img src="' + imgSrc + '" style="width: 160px; height: 100px">' +
  '<p><img src="' + imgSrc + '" style="width: 20%">' +
  '<p><img src="' + imgSrc + '">' +
  '<p><img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png">' +
  '</textarea>'
);
Insert.append(ephoxUi, demo);

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
  images_upload_handler: (data, success, failure, progress) => {
    console.log('blob upload [started]', 'id:', data.id(), 'filename:', data.filename());
    progress(0);

    setTimeout(() => {
      console.log('blob upload [ended]', data.id());
      success(data.id() + '.png');
      progress(100);
    }, 1000);
  }
});

const send = () => {
  tinymce.activeEditor.uploadImages(() => {
    console.log('saving:', tinymce.activeEditor.getContent());
  });
};

const upload = () => {
  console.log('upload [started]');

  tinymce.activeEditor.uploadImages((success) => {
    console.log('upload [ended]', success);
  });
};

const dump = () => {
  const content = tinymce.activeEditor.getContent();

  const view = SelectorFind.descendant(SugarBody.body(), '#view').getOrDie();
  Html.set(view, content);
  console.log(content);
};

const sendBtn = SugarElement.fromHtml('<button>send()</button>');
const uploadBtn = SugarElement.fromHtml('<button>upload()</button>');
const dumpBtn = SugarElement.fromHtml('<button>dump()</button>');

DomEvent.bind(sendBtn, 'click', send);
DomEvent.bind(uploadBtn, 'click', upload);
DomEvent.bind(dumpBtn, 'click', dump);

InsertAll.append(ephoxUi, [ sendBtn, uploadBtn, dumpBtn ]);

export {};
