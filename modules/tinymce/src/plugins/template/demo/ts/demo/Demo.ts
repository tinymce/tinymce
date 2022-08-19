import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'template',
  toolbar: 'template',
  height: 600,
  template_preview_replace_values: {
    username: '<em>username here</em>'
  },
  template_replace_values: {
    username: 'Jack',
    staffid: '991234'
  },
  templates: [
    { title: 'Some title 1', description: 'Some desc 1', content: 'My content {$username}' },
    { title: 'Some title 2', description: 'Some desc 2', content: 'My other content' },
    { title: 'Some remote file', description: 'Some desc 3', url: 'development.html' },
    { title: 'Nonexistent remote file', description: 'Some desc 4', url: 'invalid.html' }
  ]
});

export {};
