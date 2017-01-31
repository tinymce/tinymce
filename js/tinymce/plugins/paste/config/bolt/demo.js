configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.paste.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

