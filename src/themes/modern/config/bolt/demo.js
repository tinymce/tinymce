configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.themes.modern.demo', '../../src/demo/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/modern\//, '');
    })
  ]
});
