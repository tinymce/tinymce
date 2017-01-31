configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.anchor.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

