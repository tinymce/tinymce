define(
  'tinymce.themes.mobile.features.DefaultStyleFormats',

  [

  ],

  function () {
    return [
      {
        title: 'Headings', items: [
          { title: 'Heading 1', format: 'h1' },
          { title: 'Heading 2', format: 'h2' },
          { title: 'Heading 3', format: 'h3' },
          { title: 'Heading 4', format: 'h4' },
          { title: 'Heading 5', format: 'h5' },
          { title: 'Heading 6', format: 'h6' }
        ]
      },

      {
        title: 'Inline', items: [
          { title: 'Bold', icon: 'bold', format: 'bold' },
          { title: 'Italic', icon: 'italic', format: 'italic' },
          { title: 'Underline', icon: 'underline', format: 'underline' },
          { title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough' },
          { title: 'Superscript', icon: 'superscript', format: 'superscript' },
          { title: 'Subscript', icon: 'subscript', format: 'subscript' },
          { title: 'Code', icon: 'code', format: 'code' }
        ]
      },

      {
        title: 'Blocks', items: [
          { title: 'Paragraph', format: 'p' },
          { title: 'Blockquote', format: 'blockquote' },
          { title: 'Div', format: 'div' },
          { title: 'Pre', format: 'pre' }
        ]
      },

      {
        title: 'Alignment', items: [
          { title: 'Left', icon: 'alignleft', format: 'alignleft' },
          { title: 'Center', icon: 'aligncenter', format: 'aligncenter' },
          { title: 'Right', icon: 'alignright', format: 'alignright' },
          { title: 'Justify', icon: 'alignjustify', format: 'alignjustify' }
        ]
      }
    ];
  }
);
