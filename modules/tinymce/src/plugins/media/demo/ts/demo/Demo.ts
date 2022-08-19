import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'media',
  toolbar: 'undo redo | media',
  // media_dimensions: false,
  // media_live_embeds: false,
  file_picker_callback: (callback, value, meta) => {
    // Provide alternative source and posted for the media dialog
    if (meta.filetype === 'media') {
      callback('https://youtu.be/a4tNU2jgTZU');
    }
  },
  // media_url_resolver: function (data, resolve) {
  //   setTimeout(function () {
  //     resolve({
  //       html: '<div style="max-width: 650px;" data-ephox-embed-iri="https://youtu.be/a4tNU2jgTZU">' +
  //             '<iframe src="https://www.youtube.com/embed/a4tNU2jgTZU?feature=oembed" ' +
  //             'width="612" height="344" frameborder="0" allowfullscreen="allowfullscreen"></iframe></div>' });
  //   }, 500);
  // },
  height: 600
});

export {};
