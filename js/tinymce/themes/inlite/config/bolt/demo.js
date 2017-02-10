configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce/inlite/Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});
