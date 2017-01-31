configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.importcss.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

