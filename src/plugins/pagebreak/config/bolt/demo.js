configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.pagebreak.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

