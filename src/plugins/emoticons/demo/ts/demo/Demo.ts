declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'emoticons code',
  toolbar: 'emoticons code',
  emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
  height: 600
});

export {};
