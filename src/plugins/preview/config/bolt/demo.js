configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.preview.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

