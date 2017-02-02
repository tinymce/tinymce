configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.core.demo', '../../src/core/src/demo/js', function (id) {
      var parts = id.split('.');
      var rest = parts.slice(2);
      return rest.join('/');
    })

  ]
})