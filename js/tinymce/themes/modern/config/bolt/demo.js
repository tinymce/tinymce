configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.modern.Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});
