configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.bbcode.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

