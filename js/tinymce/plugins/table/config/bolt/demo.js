configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.table.Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});