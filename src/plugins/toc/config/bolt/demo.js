configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.toc.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

