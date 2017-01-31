configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.image.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

