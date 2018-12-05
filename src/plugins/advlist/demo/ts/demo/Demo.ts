declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists advlist code',
  toolbar: 'bullist numlist | outdent indent | code',
  height: 600
});

export {};