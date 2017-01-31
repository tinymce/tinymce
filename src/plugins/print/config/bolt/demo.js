configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.print.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

