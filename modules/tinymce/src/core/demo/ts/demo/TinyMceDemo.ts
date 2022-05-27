declare let tinymce: any;

export default () => {
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
    toolbar: 'mysidebar mysidebarwow',
    sidebar_show: 'mysidebar',
    /* eslint-disable no-console */
    setup: (ed) => {
      ed.ui.registry.addButton('demoButton', {
        text: 'Demo',
        onAction: () => {
          ed.insertContent('Hello world!');
        }
      });
      ed.ui.registry.addSidebar('mysidebar', {
        tooltip: 'My sidebar',
        icon: 'comment',
        onSetup: (api) => {
          console.log('Render panel', api.element());
        },
        onShow: (api) => {
          console.log('Show panel', api.element());
          api.element().innerHTML = 'Hello world!';
        },
        onHide: (api) => {
          console.log('Hide panel', api.element());
        }
      });

      ed.ui.registry.addSidebar('mysidebarwow', {
        tooltip: 'My sidebar wolw',
        icon: 'comment',
        onSetup: (api) => {
          console.log('Render panel', api.element());
        },
        onShow: (api) => {
          console.log('Show panel', api.element());
          api.element().innerHTML = 'Hello world wowowowo!';
        },
        onHide: (api) => {
          console.log('Hide panel', api.element());
        }
      });
    },

    selector: 'textarea.tinymce',
    toolbar1: 'demoButton bold italic',
    menubar: false,
    init_instance_callback: (editor) => {
      console.log('Editor: ' + editor.id + ' is now initialized.   ', editor.hasFocus());
    }
  });
};
