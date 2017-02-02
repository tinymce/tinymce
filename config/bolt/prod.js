configure({
  configs: [ ],
  sources: [
    source('amd', 'tinymce.core', '../../src/core/src/main/js', function (id) {
      var parts = id.split('.');
      var rest = parts.slice(2);
      return rest.join('/');
    })
  ]
})