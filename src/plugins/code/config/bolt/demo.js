configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.code.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

