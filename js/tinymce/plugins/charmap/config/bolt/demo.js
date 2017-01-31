configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.charmap.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

