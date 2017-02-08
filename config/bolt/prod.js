configure({
  configs: [ ],
  sources: [
    source('amd', 'tinymce.modern', '../../src/themes/modern/src/main/js/tinymce/modern', function (id) {
      var parts = id.split('.');
      var rest = parts.slice(2);
      return rest.join('/');
    }),
    source('amd', 'tinymce.core', '../../src/core/src/main/js', function (id) {
      var parts = id.split('.');
      var rest = parts.slice(2);
      return rest.join('/');
    })
  ]
})