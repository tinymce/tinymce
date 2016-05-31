configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce/inlight/Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});
