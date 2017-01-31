configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.autoresize.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

