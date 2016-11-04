configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.media.Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});