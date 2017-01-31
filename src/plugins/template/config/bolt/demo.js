configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.template.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

