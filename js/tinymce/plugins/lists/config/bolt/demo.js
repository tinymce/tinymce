configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.lists.Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});