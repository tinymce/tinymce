configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.fullpage.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

