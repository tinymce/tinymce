configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.link.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

