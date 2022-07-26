import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'emoticons code',
  toolbar: 'emoticons code',
  emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
  height: 600,
  emoticons_append: {
    brain_explode: {
      keywords: [ 'brain', 'explode', 'blown' ],
      char: '\ud83e\udd2f'
    }
  }
});

export {};
