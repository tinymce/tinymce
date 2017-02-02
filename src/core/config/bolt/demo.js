configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.core.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

