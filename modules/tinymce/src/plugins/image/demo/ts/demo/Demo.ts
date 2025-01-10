import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'image code',
  toolbar: 'undo redo | image code',
  image_caption: true,
  image_advtab: true,
  image_title: true,
  image_list: [
    { text: 'Google', value: 'https://www.google.com/google.jpg' }
  ],
  image_class_list: [
    { title: 'None', value: '' },
    { title: 'Class1', value: 'class1' },
    { title: 'Class2', value: 'class2' }
  ],
  images_upload_url: 'postAcceptor.php',
  file_picker_callback: (callback, _value, _meta) => {
    callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text', caption: true });
  },
  images_upload_handler: (blobInfo, _progress) => new Promise((success) => {
    // eslint-disable-next-line no-console
    console.log(blobInfo);
    setTimeout(() => {
      success('https://www.google.com/logos/google.jpg');
    }, 5000);
  }),
  height: 600
});

export { };
