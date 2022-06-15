declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'link code',
  toolbar: 'link code',
  menubar: 'view insert tools custom',
  init_instance_callback: (editor) => {
    editor.on('BeforeExecCommand', (evt) => {
      // eslint-disable-next-line no-console
      console.log(evt);
    });
    editor.on('ExecCommand', (evt) => {
      // eslint-disable-next-line no-console
      console.log(evt);
    });
  },
  link_quicklink: true,
  link_list: [
    { title: 'My page 1', value: 'https://www.tiny.cloud' },
    { title: 'My page 2', value: 'https://about.tiny.cloud' }
  ],
  menu: {
    custom: { title: 'Custom', items: 'link unlink openlink' }
  },
  height: 600,
  setup: (ed) => {
    ed.on('init', () => {
      ed.setContent('<h1>Heading</h1><p><a name="anchor1"></a>anchor here.');
    });
  }
});

export {};
