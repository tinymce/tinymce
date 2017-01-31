configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.autosave.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

