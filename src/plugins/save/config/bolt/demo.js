configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.save.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

