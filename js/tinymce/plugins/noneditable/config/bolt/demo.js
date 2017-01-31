configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.noneditable.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

