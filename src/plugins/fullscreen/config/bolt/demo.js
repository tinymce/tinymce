configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.fullscreen.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

