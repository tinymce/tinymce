configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.searchreplace.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

