import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  // plugins: 'code',
  // toolbar: 'code',
  plugins: 'a11ychecker advlist advtable anchor autolink autosave charmap advcode codesample directionality emoticons fullscreen help image insertdatetime link lists media mediaembed nonbreaking pagebreak powerpaste preview quickbars save searchreplace table visualblocks visualchars wordcount',
  toolbar: 'redo undo | styles | bold italic underline strikethrough forecolor backcolor | removeformat alignleft aligncenter alignright alignjustify | bullist numlist indent outdent | fontfamily fontsize | ltr rtl | anchor | link image media table codesample | code fullscreen',

  height: 600,
  width: 1000
});

export {};
