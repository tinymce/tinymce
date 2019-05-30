import { document } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = '<p>Bolt</p>';

  textarea.classList.add('tinymce');
  document.querySelector('#ephox-ui').appendChild(textarea);

  tinymce.init({
    // imagetools_cors_hosts: ["moxiecode.cachefly.net"],
    // imagetools_proxy: "proxy.php",
    // imagetools_api_key: '123',

    // images_upload_url: 'postAcceptor.php',
    // images_upload_base_path: 'base/path',
    // images_upload_credentials: true,
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    setup (ed) {
      ed.addButton('demoButton', {
        type: 'button',
        text: 'Demo',
        onclick () {
          ed.insertContent('Hello world!');
        }
      });
    },

    selector: 'textarea.tinymce',
    toolbar1: 'demoButton bold italic',
    menubar: false
  });
}