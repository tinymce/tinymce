import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'link code',
  toolbar: 'link unlink code',
  menubar: 'view insert tools custom',
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
      ed.setContent(`
        <h1>Heading</h1>
        <p><a name="anchor1"></a>anchor here.</p>
        <a href="#"><p>Block root link</p></a>
        <div><a href="#"><p>Block link</p></a></div>
        <a href="#">Inline root link</a>
        <p><a href="#">Inline link</a></p>
      `);
    });
  }
});

export {};
